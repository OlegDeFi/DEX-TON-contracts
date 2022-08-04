package money.tegro.dex.repository

import io.micronaut.data.annotation.Id
import io.micronaut.data.jdbc.annotation.JdbcRepository
import io.micronaut.data.model.query.builder.sql.Dialect
import io.micronaut.data.repository.kotlin.CoroutinePageableCrudRepository
import money.tegro.dex.model.PairModel
import org.ton.bigint.BigInt
import org.ton.block.MsgAddressInt
import java.time.Instant

@JdbcRepository(dialect = Dialect.POSTGRES)
interface PairRepository : CoroutinePageableCrudRepository<PairModel, MsgAddressInt> {
    suspend fun findByBaseAndQuote(base: MsgAddressInt, quote: MsgAddressInt): PairModel?

    suspend fun update(
        @Id address: MsgAddressInt,
        baseReserve: BigInt,
        quoteReserve: BigInt,
        updated: Instant = Instant.now()
    )
}
