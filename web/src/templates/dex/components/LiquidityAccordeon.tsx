import { useContext } from 'react';
import { Address, Coins } from 'ton3-core';
import { DexContext, DexContextType } from '../../../context';
import { Pair, Token } from '../../../ton/dex/api/types';

export function LiquidityAccordionComponent(
    { pair, lpBalance }:
    { pair: Address, lpBalance: Coins },
) {
    const {
        pairs, tokens,
    } = useContext(DexContext) as DexContextType;
    const PAIR = pairs.find((p) => p.address.eq(pair));

    const {
        leftToken, rightToken, leftReserved, rightReserved, lpSupply,
    } = PAIR!;

    const share = new Coins(lpBalance).div(lpSupply.toString());

    const l = tokens?.find((t) => t.address.eq(leftToken)) as Token;

    const r = tokens?.find((t) => t.address.eq(rightToken)) as Token;

    const pos = {
        left: new Coins(leftReserved).mul(share.toString()),
        right: new Coins(rightReserved).mul(share.toString()),
    };

    return (
        <div className="accordion" id="accordionLiquidity">
            <div
                className="accordion-item py-4"
                data-bs-toggle="collapse"
                data-bs-target="#collapse1"
                aria-expanded="false"
                aria-controls="collapse1"
            >
                <div className="d-flex align-items-center">
                    <div className="accordion-item__images">
                        <img
                            src={l.image}
                            alt="Tether"
                            className="wc-img"
                            style={{ width: '40px', height: '40px' }}
                        />
                        <img
                            src={r.image}
                            alt="TGR"
                            className="accordion-item__images-small"
                        />
                    </div>
                    <div className="ms-4">
                        <span className="fs-16 fw-700">{`${l.symbol} / ${r.symbol}`}</span>
                        <p className="mb-0 text-muted fs-12">{`${l.name} / ${r.name}`}</p>
                    </div>
                    <div className="ms-auto">
                        <span className="me-4 fw-500 text-muted" />
                        <i className="fa-solid fa-angle-right" />
                    </div>
                </div>
                <div
                    id="collapse1"
                    className="accordion-collapse collapse mt-4"
                    data-bs-parent="#accordionLiquidity"
                >
                    <ul className="list-unstyled p-4 bg-soft-blue rounded-8">
                        <li className="list-item d-flex align-items-center mb-4">
                            <img
                                src={l.image}
                                alt=""
                                className="wc-img"
                                style={{ width: '14px', height: '14px' }}
                            />
                            <span className="ms-2 me-auto fw-500">
                                {`${l.name} position:`}
                            </span>
                            <span className="text-muted">
                                {`${pos.left} ${l.symbol}`}
                            </span>
                        </li>
                        <li className="list-item d-flex align-items-center mb-4">
                            <img
                                src={r.image}
                                alt=""
                                className="wc-img"
                                style={{ width: '14px', height: '14px' }}
                            />
                            <span className="ms-2 me-auto fw-500">
                                {`${r.name} position:`}
                            </span>
                            <span className="text-muted">
                                {`${pos.right} ${r.symbol}`}
                            </span>
                        </li>
                        <li className="list-item d-flex mb-3">
                            <span className="me-auto fw-500">Share in the pool:</span>
                            <span className="text-muted">
                                {`${Number(new Coins(share).mul(100).toString()).toFixed(2)}%`}
                            </span>
                        </li>
                    </ul>
                    <div className="text-center mt-3">
                        <a
                            href="#!"
                            className="btn btn-sm btn-outline-danger"
                            data-bs-toggle="modal"
                            data-bs-target="#RemoveLiquidity"
                        >
                            <i className="fa-regular fa-trash-can me-2" />
                            Remove Liquidity
                        </a>
                    </div>
                </div>
            </div>

        </div>
    );
}
