package money.tegro.dex.service

import io.micrometer.core.instrument.MeterRegistry
import io.micronaut.context.event.StartupEvent
import io.micronaut.runtime.event.annotation.EventListener
import jakarta.annotation.PostConstruct
import jakarta.annotation.PreDestroy
import jakarta.inject.Singleton
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.time.delay
import money.tegro.dex.config.ServiceConfig
import money.tegro.dex.contract.TokenContract
import money.tegro.dex.contract.TokenWalletContract
import money.tegro.dex.model.WalletModel
import money.tegro.dex.repository.WalletRepository
import mu.KLogging
import net.logstash.logback.argument.StructuredArguments.kv
import org.ton.api.exception.TonException
import org.ton.block.AddrNone
import org.ton.block.AddrStd
import org.ton.block.MsgAddress
import org.ton.block.MsgAddressInt
import org.ton.lite.api.liteserver.LiteServerAccountId
import org.ton.lite.client.LiteClient
import kotlin.coroutines.CoroutineContext

@Singleton
open class WalletService(
    private val config: ServiceConfig,
    private val registry: MeterRegistry,

    private val liteClient: LiteClient,
    private val liveAccounts: Flow<AddrStd>,

    private val walletRepository: WalletRepository,
) : CoroutineScope {
    override val coroutineContext: CoroutineContext = Dispatchers.Default

    @EventListener
    open fun onStartup(event: StartupEvent) {
    }

    @PostConstruct
    open fun onInit() {
        job.start()
    }

    @PreDestroy
    open fun onShutdown() {
        job.cancel()
    }

    suspend fun getWallet(owner: MsgAddressInt, master: MsgAddress = AddrNone): WalletModel? {
        walletRepository.findByOwnerAndMaster(owner, master)?.let {
            // Shortcuts, baby
            return it
        }

        if (master == AddrNone) {
            // Simple toncoins, will just return null if account is not active
            return liteClient.getAccount(LiteServerAccountId(owner as AddrStd))?.let {
                walletRepository.save(
                    WalletModel(
                        address = owner,
                        balance = it.storage.balance.coins.amount.value,
                        owner = owner,
                        master = master,
                    )
                )
            }
        }

        if (master is MsgAddressInt) {
            // Token wallet
            return try {
                // If this or the next call fails (uninitialized wallet, or something else, return null)
                val address = TokenContract.getWalletAddress(master as AddrStd, owner, liteClient)
                val data = TokenWalletContract.of(address as AddrStd, liteClient)
                require(data.owner == owner) // Sanity check
                walletRepository.save(
                    WalletModel(
                        address = address,
                        balance = data.balance,
                        owner = data.owner,
                        master = data.jetton,
                    )
                )
            } catch (e: TonException) {
                null
            }
        }

        throw IllegalStateException("shouldn't be here")
    }

    private val job = launch {
        merge(
            // Watch live
            liveAccounts
                .mapNotNull { walletRepository.findById(it) }
                .onEach {
                    registry.counter("service.wallet.hits").increment()
                    logger.info("{} matched database entity", kv("address", it.address))
                },
            // Apart from watching live interactions, update them periodically
            channelFlow {
                while (currentCoroutineContext().isActive) {
                    logger.debug("running scheduled update of all database entities")
                    walletRepository.findAll().collect { send(it) }
                    delay(config.walletPeriod)
                }
            }
        )
            .collect {
                if (it.owner == it.address && it.master == AddrNone) { // TON balance
                    walletRepository.update(
                        it.address,
                        // TODO: Remove !!
                        liteClient.getAccount(LiteServerAccountId(it.address as AddrStd))!!.storage.balance.coins.amount.value
                    )
                } else {
                    val data = TokenWalletContract.of(it.address as AddrStd, liteClient)
                    walletRepository.update(
                        it.address,
                        data.balance,
                        data.owner,
                        data.jetton,
                    )
                }
            }
    }

    companion object : KLogging()
}
