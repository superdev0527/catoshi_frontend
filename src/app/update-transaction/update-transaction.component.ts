import { Component, OnInit } from '@angular/core';
import { FormBuilder,FormGroup,Validators,FormControl} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { DeviceDetectorService } from 'ngx-device-detector';
import Web3 from 'web3';
import { appConfig } from '../config';
import { SwapService } from '../swap/swap.service';
import { MetamaskService } from '../services/metamask.service';
import { UpdateTransactionService } from './update-transaction.service';
declare let window: any;

@Component({
  selector: 'app-update-transaction',
  templateUrl: './update-transaction.component.html',
  styleUrls: ['./update-transaction.component.scss']
})
export class UpdateTransactionComponent implements OnInit {
  public loading=false;
  isDeviceMobile=false;
  web3: any;
  networnVersion = appConfig.network;
  contractAddressResponse :any;
  ethChainId:any;
  bscChainId:any;
  isGetWalletBal=false;
  adminAddress:any;
  tokenSelected:any;
  userform = new FormGroup({
    networkType: new FormControl('', [Validators.required]),
    block: new FormControl('', [Validators.required]),
    });
  constructor(private toastr:ToastrService,     
              private deviceService: DeviceDetectorService, 
              private swapservice:SwapService,
              private metamask:MetamaskService,
              private updateTranxService : UpdateTransactionService,
                ) {
    const isMobile = this.deviceService.isMobile();
    const isTablet = this.deviceService.isTablet();
    if (isMobile) {  this.isDeviceMobile = true;  }
    if (isTablet) {  this.isDeviceMobile = true;  }
   }

  ngOnInit(): void {
    this.isGetWalletBal=true;
    if(this.isDeviceMobile){
      // this.metamask.connectWalletHandler();
      this.walletProvider();
      // this.connectWalletHandler()
    }
    // else if (localStorage.getItem('walletconnect')){
    //   this.walletProvider();
    // }
    else{      
      this.metamask.initMetaMask();
    }

    if (typeof window.web3 !== 'undefined') {
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      this.web3 = new Web3.providers.HttpProvider(appConfig.web3ProviderUrl);
    }

    this.swapservice.getContractAddresses(this.tokenSelected).subscribe((result:any)=>{
      this.contractAddressResponse = result.addresses;
      this.ethChainId = result.addresses.chain_id_eth;
      this.bscChainId = result.addresses.chain_id_bsc;
      sessionStorage.setItem('ethChainId' ,result.addresses.chain_id_eth );
      sessionStorage.setItem('bscChainId' , result.addresses.chain_id_bsc );
      this.adminAddress = this.contractAddressResponse.admin_address.map((element:any) => element.toLowerCase())
      console.log(this.adminAddress)
    })
  }

  ngDoCheck() {
    //console.log("testing of provider " , this.testprovide)
    if(this.testprovide?.chainId == this.networnVersion){
      sessionStorage.setItem('account', this.testprovide.accounts[0]);
      sessionStorage.setItem('chainId', this.testprovide.chainId)
      sessionStorage.setItem('account_ETH_trustWallet', this.testprovide.accounts[0]);
    } else if(this.testprovide?.chainId == "250"){
      sessionStorage.setItem('account', this.testprovide.accounts[0]);
      sessionStorage.setItem('chainId', this.testprovide.chainId)
      sessionStorage.setItem('account_ETH_trustWallet', this.testprovide.accounts[0]);
    } else if(this.testprovide?.chainId){
      sessionStorage.setItem('account_ETH_trustWallet_wrongNetwork' , 'account_ETH_trustWallet_wrongNetwork')
    } else{
      sessionStorage.setItem('account_ETH_trustWallet_notConnected' , 'account_ETH_trustWallet_notConnected')
    }

   this.get_set_Accounts();
   sessionStorage.setItem('swapPage' , "swap")
  }

  get_set_Accounts(){
    if (!this.isDeviceMobile && window.ethereum && window.ethereum._state && window.ethereum._state.accounts && window.ethereum._state.accounts.length) {
      if (window.ethereum._state.accounts[0] === undefined) { window.ethereum
        this.metamask.metaMaskUpdate();
      } else {
        this.metamask.metaMaskUpdated();
        if(window.ethereum?.networkVersion == this.bscChainId){
          sessionStorage.removeItem('account_ETH');
          sessionStorage.removeItem('ethBalance');
          sessionStorage.setItem('account_BSC', window.ethereum._state.accounts[0]);
          sessionStorage.setItem('swapPage' , "swap")

        }
        
         if(window.ethereum?.networkVersion == this.ethChainId){
          sessionStorage.removeItem('account_BSC');
          sessionStorage.removeItem('bscBalance');
          sessionStorage.setItem('account_ETH', window.ethereum._state.accounts[0]);
          sessionStorage.setItem('swapPage' , "swap")

          } 
      }
    } 
    // else if(localStorage.getItem('-walletlink:https://www.walletlink.org:Addresses')){
    // }
    // else if(localStorage.getItem('walletconnect')){
    // }
    else  {
      if (this.isDeviceMobile && sessionStorage.getItem('account')){
        
    }else{
      // sessionStorage.clear();
      // this.metamask.checkMetaMaskInitial();
      // this.metamask.initMetaMask();
    }
  }
 
  if(window.ethereum?.networkVersion == this.ethChainId || window.ethereum?.networkVersion == this.bscChainId){
  } else{
    sessionStorage.clear();
    // this.toster.warning("Please Select ETH or BSC Network")
  }

  this.check_get_Balance()
  }



  
    async check_get_Balance(){  
    // GET Wallet Balance
    // let ci = localStorage.getItem('walletconnect');
    // let b = sessionStorage.getItem('bscBalance');
    // if (ci && !(+b!)) {
    //   let acc = JSON.parse(ci).accounts[0]
    //   let bal = await this.web3.eth.getBalance(acc);
    //   sessionStorage.setItem('bscBalance', (bal * Math.pow(10,-18)).toFixed(6));
    //   return;
    // }
    if(this.isGetWalletBal){
    if(sessionStorage.getItem('account_BSC')){
      let bscWalletAddress = sessionStorage.getItem('account_BSC');  
      // let bscWalletAddress = window.ethereum._state.accounts[0]                         
      this.swapservice.getBSCBalanace(bscWalletAddress,this.tokenSelected).subscribe((result: any) => {   //GET BSC BALANCE
        sessionStorage.removeItem('ethBalance')
        sessionStorage.setItem('bscBalance', result.Tokens);
        this.isGetWalletBal=false;
        // this.currentWalletbalance = BigInt(result.Tokens / Math.pow(10,18))
        // sessionStorage.setItem
      })
      // this.swapservice.getFantom_vaultBalance().subscribe((result:any)=>{  //For Vault Balance
      //   let res:any = result.vault_balance;
      //   sessionStorage.removeItem('BSC_vault_balance');
      //   sessionStorage.setItem('FANTOM_vault_balance' , res )   
      // })
    } else if(sessionStorage.getItem('account_ETH')){
      let ethWalletAddress = sessionStorage.getItem('account_ETH');
      // let ethWalletAddress = window.ethereum._state.accounts[0]   
        this.swapservice.getETHBalanace(ethWalletAddress,this.tokenSelected).subscribe((result: any) => {  // GET ETH BALANCE
          sessionStorage.removeItem('bscBalance')
          sessionStorage.setItem('ethBalance', result.Tokens);
          this.isGetWalletBal=false;
        })
        // this.swapservice.getBSC_vaultBalance().subscribe((result:any)=>{    //For Vault Balance
        //   let res:any = result.vault_balance;
        //   sessionStorage.removeItem('FANTOM_vault_balance');
        //   sessionStorage.setItem('BSC_vault_balance' , res )
        // })
    } 
    else if(sessionStorage.getItem('chainId') == this.networnVersion){
      let bscWalletAddress = sessionStorage.getItem('account_ETH_trustWallet');  
      // let bscWalletAddress = window.ethereum._state.accounts[0]                         
      this.swapservice.getBSCBalanace(bscWalletAddress,this.tokenSelected).subscribe((result: any) => {   //GET BSC BALANCE
        sessionStorage.removeItem('ethBalance')
        sessionStorage.setItem('bscBalance', result.Tokens);
        this.isGetWalletBal=false;
      })
    } else if(sessionStorage.getItem('chainId') == "250"){
      let ethWalletAddress = sessionStorage.getItem('account_ETH_trustWallet');
      // let ethWalletAddress = window.ethereum._state.accounts[0]   
        this.swapservice.getETHBalanace(ethWalletAddress,this.tokenSelected).subscribe((result: any) => {  // GET ETH BALANCE
          sessionStorage.removeItem('bscBalance')
          sessionStorage.setItem('ethBalance', result.Tokens);
          this.isGetWalletBal=false;
        })
    }
  }
  }

  get userFormControl() {
    return this.userform.controls;
  }


  submit(){
   if(sessionStorage.getItem('account_ETH')  || sessionStorage.getItem('account_BSC')){
    // this.adminAddress = [ '0x54663a3486c5e99b347719589f96a4eb1fbb9330' , '0x111e465f00ca7ec4585ef57ff475c4b5b8ef9f3b'];
    let selectAccountAddress:any;
    if(sessionStorage.getItem('account_ETH')){
               selectAccountAddress = sessionStorage.getItem('account_ETH')
    } else if(sessionStorage.getItem('account_BSC')){
              selectAccountAddress = sessionStorage.getItem('account_BSC')
    }

    let isValidUser = this.adminAddress.find( (a:any) => a == selectAccountAddress)
    console.log(isValidUser)
      if(isValidUser){
     
         let blockNumber = this.userform.controls.block.value
        
        if(this.userform.controls.networkType.value == "BSC"){
          this.loading=true;
            this.updateTranxService.byBSC(blockNumber).subscribe((result:any)=>{
              // console.log("bsc res " , result);
              if(result.status == "true"){
                this.toastr.success(result.message);
                this.loading=false;
              } else{
                this.loading=false;
                this.toastr.error(result.message)
              }
            })
        } else if(this.userform.controls.networkType.value == "FTM"){
          this.loading=true;
          this.updateTranxService.byETH(blockNumber).subscribe((result:any)=>{
            // console.log("bsc eth " , result);
            if(result.status == "true"){
              this.toastr.success(result.message);
              this.loading=false;
            } else{
              this.toastr.error(result.message);
              this.loading=false;
            }
          })
        }
      } else{
        this.toastr.error("Unauthorized User ")
      }
   } else{
     this.toastr.info('Please connect to the appropriate FTM or BSC Network')
   }
  }









  testprovide:any;
  async walletProvider() {
    // this.headerService.connectWalletFromDashboard.next(null);
  const provider: any = new WalletConnectProvider({
      // infuraId: appConfig.infuraId,
      rpc:{
        97: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      },
      // chainId: 97,
      qrcodeModalOptions: {
        mobileLinks: [
          "metamask",
          "trust",
        ],
      },
    });
    await provider.enable();
    this.testprovide=provider;
  
    this.web3 = new Web3(provider);
    const accounts = await this.web3.eth.getAccounts();
    if (accounts[0]) {
    if(provider.chainId == this.bscChainId){
      sessionStorage.setItem('account', accounts[0]);
      sessionStorage.setItem('chainId', provider.chainId)
      sessionStorage.setItem('account_BSC', accounts[0]);
    } else if(provider.chainId == "250"){
      sessionStorage.setItem('account', accounts[0]);
      sessionStorage.setItem('chainId', provider.chainId)
      sessionStorage.setItem('account_ETH_trustWallet', accounts[0]);
    } else if(provider.chainId){
      sessionStorage.setItem('account_ETH_trustWallet_wrongNetwork' , 'account_ETH_trustWallet_wrongNetwork')
    } else{
      sessionStorage.setItem('account_ETH_trustWallet_notConnected' , 'account_ETH_trustWallet_notConnected')
    }

      // this.connectStatus = true;
      if (!localStorage.getItem('walletConnected')) {
        localStorage.setItem('walletConnected', 'success');
        location.reload();
      }
    };
  
  
    provider.on("disconnect", (code: number, reason: string) => {
      // console.log(code, reason);
      sessionStorage.removeItem('account');
      sessionStorage.removeItem('chainId');
      sessionStorage.removeItem('account_ETH_trustWallet');
      sessionStorage.removeItem('account_ETH_trustWallet_notConnected');
      sessionStorage.removeItem('account_ETH_trustWallet_wrongNetwork')
      if (code == 1000) {
        // this.headerService.web3Instance.next(false);
        // this.metaMaskConnected = false;
        sessionStorage.removeItem('account');
        localStorage.removeItem('walletConnected');
        location.reload();
        // this.connectStatus = false;
      }
    })
  
    // this.headerService.web3Instance.next(true);
    provider.on('accountsChanged', (accounts: string[]) => {
      // this.accountAddress = accounts[0];
      sessionStorage.setItem('account', accounts[0]);
      localStorage.setItem('walletConnected', 'success');
      // this.connectStatus = true;
      location.reload();
    });

    provider.on('networkChanged', async (network: number) => {
      location.reload();
      // this.connectStatus = true;
  });
  provider.on('onConnect', async (network: number) => {
    location.reload();
    // this.connectStatus = true;
});
  }

}
