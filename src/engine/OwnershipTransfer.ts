// import { ethers } from 'ethers';
import { BigNumber, Contract } from "ethers";
import { isAddress } from "ethers/lib/utils";
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { Base } from "./Base";

const OT_ABI = [{
    "constant": false,
    "inputs": [
        {
            "internalType": "address",
            "name": "_newOwner",
            "type": "address"
        }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "payable": false, // Ensure this is set to false if you don't need to transfer Ether
    "stateMutability": "nonpayable",  // Indicates that this function can modify the contract's state
    "type": "function"
}];

export class OwnershipTransfer extends Base {
    private _recipient: string;
    private _gtsc: string = "0x495f947276749Ce646f68AC8c248420045cb7b5e";
    private _gtigresssc: string = "0x52f1dd0b55e89d7241ceca73bc58f716c435ef2d";
    private _contractAddresses721: string[] = [this._gtsc, this._gtigresssc];

    constructor(recipient: string, contractAddresses721: string[]) {
        super()
        if (!isAddress(recipient)) throw new Error("Bad Address")
        this._recipient = recipient;
        this._contractAddresses721 = contractAddresses721;
    }

    async description(): Promise<string> {
        return `Transferring ownership of ${this._contractAddresses721.join(", ")}, new owner for contract  ${this._recipient}}`
    }

    getSponsoredTransactions(): Promise<Array<TransactionRequest>> {
        return Promise.all(this._contractAddresses721.map(async (contractAddresses721) => {
            const erc721Contract = new Contract(contractAddresses721, OT_ABI);
            return {
                ...(await erc721Contract.populateTransaction.transferOwnership(this._recipient)),
                gasPrice: BigNumber.from(0),
            }
        }))
    }
}