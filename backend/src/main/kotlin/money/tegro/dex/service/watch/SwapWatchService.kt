package money.tegro.dex.service.watch

import io.micronaut.scheduling.annotation.Scheduled
import jakarta.inject.Singleton
import kotlinx.coroutines.reactor.mono
import money.tegro.dex.contract.toSafeBounceable
import money.tegro.dex.repository.ExchangePairRepository
import money.tegro.dex.source.LiveTransactionSource
import mu.KLogging
import net.logstash.logback.argument.StructuredArguments.kv
import org.ton.bigint.BigInt
import org.ton.block.AddrStd
import org.ton.block.Coins
import org.ton.block.IntMsgInfo
import org.ton.block.MsgAddress
import org.ton.tlb.loadTlb

@Singleton
class SwapWatchService(
    private val transactionSource: LiveTransactionSource,
    private val exchangePairRepository: ExchangePairRepository,
) {
    @Scheduled(initialDelay = "0s") // Set it up as soon as possible
    fun setup() {
        transactionSource
            .asFlux()
            // We only care for an in message from exchange pairs to:
            // a) Their respective jetton wallet in order to transfer jettons to the user
            // b) The user directly, when swapping XXX->TON
            .concatMap { mono { it.in_msg.value } }
            .filterWhen {
                mono {
                    // If null, this mono emits nothing and we just filter this transaction out
                    (it.info as? IntMsgInfo)?.src as? AddrStd
                }
                    .flatMap { exchangePairRepository.existsById(it) }
            }
            .subscribe {
                val info = it.info as IntMsgInfo
                (it.body.x ?: it.body.y)?.let { body ->
                    val bs = body.beginParse()

                    when (val op = bs.loadUInt(32)) {
                        OP_TRANSFER -> { // Jetton transfer, need to further parse the payload
                            val queryId = bs.loadUInt(64)
                            val amount = bs.loadTlb(Coins).amount.value
                            val destination = bs.loadTlb(MsgAddress) as AddrStd // Just die if not addrstd
                            bs.loadTlb(MsgAddress) // Skip the second one, it's equal to destination

                            // These are appended straight to the payload
                            bs.loadUInt(1)
                            bs.loadTlb(Coins) // ton_amount
                            bs.loadUInt(1)

                            when (val innerOp = bs.loadUInt(32)) {
                                OP_SUCCESSFUL_SWAP -> {
                                    logger.debug(
                                        "{} - successful jetton swap of {} to {}",
                                        kv("op", innerOp.toString(16)),
                                        kv("value", amount),
                                        kv("address", destination.toSafeBounceable())
                                    )
                                    // TODO: We don't know what particular jetton was sent in case of Jetton/Jetton pairs
                                }
                                else ->
                                    TODO("unsupported inner op")
                            }

                        }
                        OP_SUCCESSFUL_SWAP -> { // TON transfer, easy one
                            logger.debug(
                                "{} - successful ton swap of {} to {}",
                                kv("op", op.toString(16)),
                                kv("value", info.value.coins.amount.value),
                                kv("address", (info.dest as AddrStd).toSafeBounceable())
                            )
                        }
                        else -> {
                            logger.warn(
                                "unknown {}, cannot determine if it is a swap or not",
                                kv("op", op.toString(16))
                            )
                        }
                    }
                }
                logger.warn { "HOORAY $it" }
            }
    }

    companion object : KLogging() {
        val OP_TRANSFER = BigInt(0xf8a7ea5);
        val OP_SUCCESSFUL_SWAP = BigInt(0xde6e0675);
    }
}
