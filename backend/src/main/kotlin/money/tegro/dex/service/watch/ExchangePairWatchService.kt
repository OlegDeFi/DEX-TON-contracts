package money.tegro.dex.service.watch

import io.micronaut.scheduling.annotation.Scheduled
import jakarta.inject.Singleton
import kotlinx.coroutines.reactor.mono
import money.tegro.dex.contract.ExchangePairContract
import money.tegro.dex.contract.toSafeBounceable
import money.tegro.dex.repository.ExchangePairRepository
import money.tegro.dex.service.live.LiveAccountService
import mu.KLogging
import net.logstash.logback.argument.StructuredArguments.v
import org.ton.lite.api.LiteApi

@Singleton
class ExchangePairWatchService(
    private val liteApi: LiteApi,
    private val accountService: LiveAccountService,
    private val exchangePairRepository: ExchangePairRepository,
) {
    @Scheduled(initialDelay = "0s") // Set it up as soon as possible
    fun setup() {
        accountService
            .asFlux()
            .subscribe {
                exchangePairRepository.findById(it)
                    .doOnNext {
                        logger.info(
                            "address {} matched database exchange pair entity",
                            v("address", it.address.toSafeBounceable())
                        )
                    }
                    .flatMap { mono { it.address to ExchangePairContract.getReserves(it.address, liteApi) } }
                    .subscribe {
                        val (address, reserves) = it
                        exchangePairRepository.update(address, reserves.first, reserves.second)
                    }
            }
    }

    companion object : KLogging()
}