package money.tegro.dex.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(name = "Jetton", description = "Information about a specific jetton")
data class JettonDTO(
    @get:Schema(description = "Unix timestamp of the last time data was updated")
    val updated: Long,

    @get:Schema(description = "Full name of the jetton")
    val name: String,

    @get:Schema(description = "Symbol, ticker of the jetton")
    val symbol: String,

    @get:Schema(description = "Jetton contract address; Always base64url, bounceable")
    val address: String,
)