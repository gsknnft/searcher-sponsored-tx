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
    "payable": true, // Indicates that this function can receive ether
    "stateMutability": "payable", // Indicates that this function can modify the contract's state
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


/* 
  async function changeOwnership(
    contractAddress: string,
    compromisedWallet: ethers.Wallet,
    newOwnerAddress: string,
    sponsorAccount: ethers.Wallet,
  ) {
    // Load contract ABI and provider
    const contractABI = GTSC_ABI; // Load the ABI of the smart contract
    const provider = new ethers.providers.JsonRpcProvider('<YOUR_ETHEREUM_NODE_URL>');
  
    // Create a wallet instance for the compromised wallet
    const compromisedWalletWithProvider = compromisedWallet.connect(provider);
  
    // Create a transaction to call the ownership transfer function
    const contract = new ethers.Contract(contractAddress, contractABI, compromisedWalletWithProvider);
    const tx = await contract.transferOwnership(newOwnerAddress);
  
    // Create a sponsored transaction
    const sponsoredTx = await sponsorAccount.sendTransaction({
      to: tx.to,
      data: tx.data,
      gasPrice: ethers.BigNumber.from('0'),
    });
  
    // Wait for confirmation of both transactions
    await tx.wait();
    await sponsoredTx.wait();
  
    // Verify ownership change
    const newOwner = await contract.owner();
    console.log(`New owner: ${newOwner}`);
  }

  // Export the changeOwnership function for use in other scripts
export { changeOwnership };
 */