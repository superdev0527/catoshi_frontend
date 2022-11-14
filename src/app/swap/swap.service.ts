import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { env } from 'process';
@Injectable({
  providedIn: 'root'
})
export class SwapService {
  private bscBalance = environment.apiurl + 'balanceOf_BSC';
  private bscToeth = environment.apiurl + 'getETHAmountAfterFee';
  private ethBalance = environment.apiurl + 'balanceOf_ETH';
  private ethtobsc = environment.apiurl + 'getBSCAmountAfterFee';
  private ftmBalance = environment.apiurl + 'balanceOf_FTM';
  private bsctoftm = environment.apiurl + 'getFTMAmountAfterFee';




  private swapBsc = environment.apiurl + 'getTransactionResponse?txHash=';
  private swapeth = environment.apiurl + 'getTransactionResponseETH?txHash=';
  
  private ETHbridgeFee = environment.apiurl + 'getETHBridgeFees';
  private BSCbridgeFee = environment.apiurl + 'getBSCBridgeFees';
  private FTMbridgeFee = environment.apiurl + 'getFTMBridgeFees';
  private getContratAddress = environment.apiurl + 'getContractAddress';

  private getFtmVaultBalance = environment.apiurl + 'FTMVaultBalance';
  private getBscVaultBalance = environment.apiurl + 'BSCVaultBalance';
  private getEthVaultBalance = environment.apiurl + 'ETHVaultBalance';

  constructor(private http:HttpClient) {
    
   }

   getBSCBalanace(bscWalletAddress:any, token:any){
     return this.http.get(this.bscBalance+ '?token=' + token +'&userAddress=' + bscWalletAddress);
   }

   bscToEthConvert(data:any, token:any){
     return this.http.get(this.bscToeth+ '?token=' + token +'&amount=' +data)
   }

   getETHBalanace(ethWalletAddress:any, token:any){
    return this.http.get(this.ethBalance+ '?token=' + token +'&userAddress=' + ethWalletAddress);
  }

  ethToBscConvert(data:any, token:any){
    return this.http.get(this.ethtobsc+'?token=' + token +'&amount=' +data)
  }

  getFTMBalanace(ethWalletAddress:any, token:any){
    return this.http.get(this.ftmBalance+ '?token=' + token +'&userAddress=' + ethWalletAddress);
  }

  bscToFtmConvert(data:any, token:any){
    return this.http.get(this.bsctoftm+ '?token=' + token +'&amount=' +data)
  }

  bscSwap(trnxHash:any , timeStamp:any , swapAmount:any, token:any, toChain:any){
    return this.http.get(environment.apiurl + "getBSCTransactionResponse?txHash=" + trnxHash + "&fromTimestamp=" + timeStamp + "&swapAmount=" + swapAmount + "&token=" + token + "&toChain=" + toChain);
  }

  ethSwap(trnxHash:any , timeStamp:any , swapAmount:any, token:any){
    return this.http.get(environment.apiurl + "getETHTransactionResponse?txHash=" + trnxHash + "&fromTimestamp=" + timeStamp + "&swapAmount=" + swapAmount + "&token=" + token + "&toChain=BSC");
  }

  ftmSwap(trnxHash:any , timeStamp:any , swapAmount:any, token:any){
    return this.http.get(environment.apiurl + "getFTMTransactionResponse?txHash=" + trnxHash + "&fromTimestamp=" + timeStamp + "&swapAmount=" + swapAmount + "&token=" + token + "&toChain=BSC");
  }


  checkBSCAllowance(amount:any , userAddress:any, token:any ){
    return this.http.get(environment.apiurl + "checkBSCAllowance?amount=" + amount + "&userAddress=" + userAddress + "&token=" + token);
  }

  checkETHAllowance(amount:any , userAddress:any , token:any){
    return this.http.get(environment.apiurl + "checkETHAllowance?amount=" + amount + "&userAddress=" + userAddress + "&token=" + token);
  }

  checkFTMAllowance(amount:any , userAddress:any , token:any){
    return this.http.get(environment.apiurl + "checkFTMAllowance?amount=" + amount + "&userAddress=" + userAddress + "&token=" + token);
  }


  getETHbridgeFee(token:any, toChain:any){
    return this.http.get(this.ETHbridgeFee +"?toChain=" + toChain +"&token=" + token);
  }

  getBSCbridgeFee(token:any, toChain:any){
    return this.http.get(this.BSCbridgeFee +"?toChain=" + toChain +"&token=" + token)
  }

  getFTMbridgeFee(token:any, toChain:any){
    return this.http.get(this.FTMbridgeFee +"?toChain=" + toChain +"&token=" + token)
  }

  
  getContractAddresses(token:any){
    return this.http.get(this.getContratAddress + "?token=" + token)
  }

  getBSC_vaultBalance(token:any){
    return this.http.get(this.getBscVaultBalance + "?token=" + token);
  }

  getFTM_vaultBalance(token:any){
    return this.http.get(this.getFtmVaultBalance + "?token=" + token)
  }

  getETH_vaultBalance(token:any){
    return this.http.get(this.getEthVaultBalance + "?token=" + token)
  }

}
