import { ethers } from 'ethers';
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

export class OwnershipTransferDirect extends Base {
    private _recipient: string;
    private _gtigresssc: string = "0x52f1dd0b55e89d7241ceca73bc58f716c435ef2d";
    private _contractAddresses721: string[] = [this._gtigresssc];

    constructor(recipient: string, contractAddresses721: string[]) {
        super()
        if (!isAddress(recipient)) throw new Error("Bad Address")
        this._recipient = recipient;
        this._contractAddresses721 = contractAddresses721;
    }

    async description(): Promise<string> {
        return `Transferring ownership of ${this._contractAddresses721.join(", ")}, new owner for contract  ${this._recipient}}`
    }
    async execute(): Promise<void> {
        const wallet = new ethers.Wallet("YOUR_PRIVATE_KEY");

        for (const contractAddress of this._contractAddresses721) {
            const erc721Contract = new Contract(contractAddress, OT_ABI, wallet);
            const tx = await erc721Contract.transferOwnership(this._recipient);

            console.log(`Transferring ownership of contract ${contractAddress} to ${this._recipient}`);

            await tx.wait();
            console.log(`Ownership transferred for contract ${contractAddress}`);
        }
    }

    async getSponsoredTransactions(): Promise<Array<TransactionRequest>> {
        return Promise.all(this._contractAddresses721.map(async (contractAddress) => {
            const erc721Contract = new Contract(contractAddress, OT_ABI);
            return {
                ...(await erc721Contract.populateTransaction.transferOwnership(this._recipient)),
                gasPrice: BigNumber.from(0),
            }
        }));
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