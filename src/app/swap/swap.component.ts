import { Component, OnInit } from '@angular/core';
import { DecimalPipe  , DatePipe } from '@angular/common';
import {Title} from "@angular/platform-browser";
import { FormBuilder,FormGroup,Validators,FormControl} from '@angular/forms';
// import { NgxSpinnerService } from "ngx-spinner";
import { SwapService } from './swap.service';
import { MetamaskService } from '../services/metamask.service';
import { appConfig } from '../config';
import { ToastrService } from 'ngx-toastr';
import { DeviceDetectorService } from 'ngx-device-detector';

import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3 from 'web3';

declare let window: any;
@Component({
  selector: 'app-swap',
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.scss'],
  providers: [DatePipe]
})
export class SwapComponent implements OnInit {
  public loading = false;
  //JSON For AllCryptocurrencies List
  allCryptoList = [
    { id: 1, name: 'BSC', logo: 'assets/images/bsclogo.png' },
    { id: 2, name: 'ETH', logo: 'assets/images/ethlogo.png' },
    { id: 3, name: 'FTM', logo: 'assets/images/ftm.png' },

  ];
  allCryptoList1 = [
    { id: 4, names: 'BSC', logo: 'assets/images/bsclogo.png' },
    { id: 5, names: 'ETH', logo: 'assets/images/ethlogo.png' },
    { id: 6, names: 'FTM', logo: 'assets/images/ftm.png' },
  ];

  tokenList = [
    { id: 1, name: 'CATOSHI', logo: 'assets/images/icon.png' },
    { id: 2, name: 'SHIH', logo: 'assets/images/shihLogo.png' },
    { id: 3, name: 'DOGEX', logo: 'assets/images/dogexLogo.png' },
  ];

  // chainToId = {
  //   ETH :1,
  //   BSC: 56,
  //   FTM: 250
  // }

  //FROM and TO 
   userform = new FormGroup({
    from: new FormControl('', [Validators.required]),
    to: new FormControl(''),
    tokenList: new FormControl(''),
    FromCrypto: new FormControl(''),
    ToCrypto: new FormControl(''),
    });
  constructor(private metamask:MetamaskService,
    private deviceService: DeviceDetectorService,
    private toster:ToastrService,
    // private spinner: NgxSpinnerService,
    private swapservice:SwapService,
    private decimalpipe : DecimalPipe,
    private titleService: Title) {
    this.titleService.setTitle('The Crossing')
    const isMobile = this.deviceService.isMobile();
    const isTablet = this.deviceService.isTablet();
    if (isMobile) {  this.isDeviceMobile = true;  }
    if (isTablet) {  this.isDeviceMobile = true;  }
   }
  vaultBalance:any;
  isDeviceMobile=false;
  token:any;
  web3: any;
  response:any;
  bscSwap:any;
  ethSwap:any;
  ftmSwap:any;
  tokenSelected:any;
  walletConnect:any;
  tempWeb3_eth:any;
  tempWeb3_bsc:any;
  toChain:any;
  bscBridgeFee:any;
  ftmBridgeFee:any;
  decimal:any;
  ethBridgeFee:any;
  isGetWalletBal=false;
  networnVersion = appConfig.network;
  contractAddressResponse :any;
  notSupported:any;
  ethChainId=3;
  bscChainId=97;
  ftmChainId=4002;
  ngOnInit(): void {   
      this.isGetWalletBal=true;
      console.log("first")
      let selected = sessionStorage.getItem('tokenSelected');
      console.log("selected",selected)
      if(selected ==null) {
      this.userform.patchValue({
        tokenList : "SHIH",
      })
      this.tokenSelected = "SHIH"


    }else {
      this.userform.patchValue({
        tokenList :selected,
      })
      this.tokenSelected = selected

    }
      sessionStorage.setItem('ethChainId' ,'3' );
      sessionStorage.setItem('bscChainId' , '97' )
      sessionStorage.setItem('ftmChainId' , '4002' )
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
        sessionStorage.setItem('ethChainId' ,'3' );
      sessionStorage.setItem('bscChainId' , '97' )
      sessionStorage.setItem('ftmChainId' , '4002' )

      }

    if (typeof window.web3 !== 'undefined') {
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      this.web3 = new Web3.providers.HttpProvider(appConfig.web3ProviderUrl);
    }
    // console.log("test web3 " , this.web3)
    this.get_set_Accounts()
    

    this.swapservice.getBSCbridgeFee(this.tokenSelected, "ETH").subscribe((result:any)=>{
      // console.log(result);
      this.bscBridgeFee = result.bridgeFees
      this.decimal = result.decimal;

      console.log("bridge fees",this.bscBridgeFee)
    })

    this.swapservice.getETHbridgeFee(this.tokenSelected,"BSC").subscribe((result:any)=>{
      // console.log(result);
      this.ethBridgeFee =result.bridgeFees
      this.decimal = result.decimal;

    })

    this.swapservice.getFTMbridgeFee(this.tokenSelected,"BSC").subscribe((result:any)=>{
      // console.log(result);
      this.ftmBridgeFee =result.bridgeFees
      this.decimal = result.decimal;

    })

    this.swapservice.getContractAddresses(this.tokenSelected).subscribe((result:any)=>{
      this.contractAddressResponse = result;
      sessionStorage.setItem('ethChainId' ,'3' );
      sessionStorage.setItem('bscChainId' , '97' )
      sessionStorage.setItem('ftmChainId' , '4002' )

      console.log("123")
      // this.ethChainId = result.addresses.chain_id_eth;
      // this.bscChainId = result.addresses.chain_id_bsc;
      // sessionStorage.setItem('ethChainId' ,'3' );
      // sessionStorage.setItem('bscChainId' , '97' )
    })

    }


    

  ngDoCheck() {
    //console.log("testing of provider " , this.testprovide)
    if(this.testprovide?.chainId == this.networnVersion){
      sessionStorage.setItem('account', this.testprovide.accounts[0]);
      sessionStorage.setItem('chainId', this.testprovide.chainId)
      sessionStorage.setItem('account_ETH_trustWallet', this.testprovide.accounts[0]);
    } else if(this.testprovide?.chainId == "3"){
      sessionStorage.setItem('account', this.testprovide.accounts[0]);
      sessionStorage.setItem('chainId', this.testprovide.chainId)
      sessionStorage.setItem('account_ETH_trustWallet', this.testprovide.accounts[0]);
    }else if(this.testprovide?.chainId == "4002"){
      sessionStorage.setItem('account', this.testprovide.accounts[0]);
      sessionStorage.setItem('chainId', this.testprovide.chainId)
      sessionStorage.setItem('account_FTM', this.testprovide.accounts[0]);
      console.log("a1")
    }
     else if(this.testprovide?.chainId){
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
          sessionStorage.removeItem('account_FTM');
          sessionStorage.removeItem('ftmBalance');
          sessionStorage.setItem('account_BSC', window.ethereum._state.accounts[0]);
          sessionStorage.setItem('swapPage' , "swap")

        }
        
         if(window.ethereum?.networkVersion == this.ethChainId){
          sessionStorage.removeItem('account_BSC');
          sessionStorage.removeItem('bscBalance');
          sessionStorage.removeItem('account_FTM');
          sessionStorage.removeItem('ftmBalance');
          sessionStorage.setItem('account_ETH', window.ethereum._state.accounts[0]);
          sessionStorage.setItem('swapPage' , "swap")

          } 

          if(window.ethereum?.networkVersion == this.ftmChainId){
            sessionStorage.removeItem('account_BSC');
            sessionStorage.removeItem('bscBalance');
            sessionStorage.removeItem('account_ETH');
          sessionStorage.removeItem('ethBalance');
            sessionStorage.setItem('account_FTM', window.ethereum._state.accounts[0]);
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
 
  if(window.ethereum?.networkVersion == this.ethChainId || window.ethereum?.networkVersion == this.bscChainId || window.ethereum?.networkVersion == this.ftmChainId){
  } else{
    sessionStorage.clear();
    console.log("networkID",window.ethereum?.networkVersion)
    // this.toster.warning("Please Select ETH or BSC or FTM Network")
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
        sessionStorage.setItem('bscBalance', result.Tokens);
        sessionStorage.removeItem('ethBalance')
        sessionStorage.removeItem('ftmBalance')
        console.log('bscBalance',result.Tokens)
        this.isGetWalletBal=false;
        // this.currentWalletbalance = BigInt(result.Tokens / Math.pow(10,18))
        // sessionStorage.setItem
      })
      this.swapservice.getFTM_vaultBalance(this.tokenSelected).subscribe((result:any)=>{  //For Vault Balance
        let res:any = result.vault_balance;
        sessionStorage.removeItem('BSC_vault_balance');
        sessionStorage.setItem('FTM_vault_balance' , res )   
      })
      this.swapservice.getETH_vaultBalance(this.tokenSelected).subscribe((result:any)=>{  //For Vault Balance
        let res:any = result.vault_balance;
        sessionStorage.removeItem('BSC_vault_balance');
        sessionStorage.setItem('ETH_vault_balance' , res )   
      })
    } else if(sessionStorage.getItem('account_ETH')){
      let ethWalletAddress = sessionStorage.getItem('account_ETH');
      // let ethWalletAddress = window.ethereum._state.accounts[0]   
        this.swapservice.getETHBalanace(ethWalletAddress,this.tokenSelected).subscribe((result: any) => {  // GET ETH BALANCE
          sessionStorage.removeItem('bscBalance')
          sessionStorage.removeItem('ftmBalance')
          sessionStorage.setItem('ethBalance', result.Tokens);
          this.isGetWalletBal=false;
        })
        this.swapservice.getBSC_vaultBalance(this.tokenSelected).subscribe((result:any)=>{    //For Vault Balance
          let res:any = result.vault_balance;
          sessionStorage.removeItem('ETH_vault_balance');
          sessionStorage.removeItem('FTM_vault_balance');
          sessionStorage.setItem('BSC_vault_balance' , res )
        })
    } else if(sessionStorage.getItem('account_FTM')){
      let ftmWalletAddress = sessionStorage.getItem('account_FTM');
      // let ethWalletAddress = window.ethereum._state.accounts[0]   
        this.swapservice.getFTMBalanace(ftmWalletAddress,this.tokenSelected).subscribe((result: any) => {  // GET ETH BALANCE
          sessionStorage.removeItem('bscBalance')
          sessionStorage.removeItem('ethBalance')
          sessionStorage.setItem('ftmBalance', result.Tokens);
          this.isGetWalletBal=false;
        })
        this.swapservice.getBSC_vaultBalance(this.tokenSelected).subscribe((result:any)=>{    //For Vault Balance
          let res:any = result.vault_balance;
          sessionStorage.removeItem('ETH_vault_balance');
          sessionStorage.removeItem('FTM_vault_balance');
          sessionStorage.setItem('BSC_vault_balance' , res )
        })
    }
    else if(sessionStorage.getItem('chainId') == this.networnVersion){
      let bscWalletAddress = sessionStorage.getItem('account_ETH_trustWallet');  
      // let bscWalletAddress = window.ethereum._state.accounts[0]                         
      this.swapservice.getBSCBalanace(bscWalletAddress,this.tokenSelected).subscribe((result: any) => {   //GET BSC BALANCE
        sessionStorage.removeItem('ethBalance')
        sessionStorage.setItem('bscBalance', result.Tokens);
        this.isGetWalletBal=false;
      })
    } else if(sessionStorage.getItem('chainId') == "3"){
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


  ngAfterContentInit(){  
    this.loading=true
   setTimeout(() => {
     this.loading=false
    if(window.ethereum?.networkVersion == this.bscChainId && sessionStorage.getItem('account_BSC')){
      this.bscSwap = true;
      this.ethSwap = false;
      this.ftmSwap = false;
      this.walletConnect = false;
      this.insuffBalError=false;
      this.userform.patchValue({
        FromCrypto : "BSC",
        ToCrypto : "ETH"
      })
      this.allCryptoList1 = [
        // { id: 4, names: 'BSC', logo: 'assets/images/bsclogo.png' },
        { id: 5, names: 'ETH', logo: 'assets/images/ethlogo.png' },
        { id: 6, names: 'FTM', logo: 'assets/images/ftm.png' },
      ];
      this.isSelected="BSC";
      this.toChain = "ETH";
      sessionStorage.setItem('toChain' , "ETH")
    } else if (window.ethereum?.networkVersion == this.ethChainId && sessionStorage.getItem('account_ETH')){
      this.bscSwap = false;
      this.ethSwap = true;
      this.ftmSwap = false;
      this.walletConnect = false;
      this.insuffBalError=false;
      this.userform.patchValue({
        FromCrypto : "ETH",
        ToCrypto : "BSC"
      })
      this.allCryptoList1 = [
        { id: 4, names: 'BSC', logo: 'assets/images/bsclogo.png' },
        // { id: 5, names: 'ETH', logo: 'assets/images/ethlogo.png' },
        // { id: 6, names: 'FTM', logo: 'assets/images/ftm.png' },
      ];
      this.toChain = "BSC";
      this.isSelected="ETH";
      sessionStorage.setItem('toChain' , "BSC")
    }else if (window.ethereum?.networkVersion == this.ftmChainId && sessionStorage.getItem('account_FTM')){
      this.bscSwap = false;
      this.ethSwap = false;
      this.ftmSwap = true;
      this.walletConnect = false;
      this.insuffBalError=false;
      this.userform.patchValue({
        FromCrypto : "FTM",
        ToCrypto : "BSC"
      })
      this.allCryptoList1 = [
        { id: 4, names: 'BSC', logo: 'assets/images/bsclogo.png' },
        // { id: 5, names: 'ETH', logo: 'assets/images/ethlogo.png' },
        // { id: 6, names: 'FTM', logo: 'assets/images/ftm.png' },
      ];
      this.isSelected="FTM";
      this.toChain = "BSC";
      sessionStorage.setItem('toChain' , "BSC")
    }else if(!window?.ethereum?.selectedAddress){
      this.walletConnect = true;
      this.bscSwap=false;
      this.ethSwap=false;
      this.ftmSwap = false;
      this.insuffBalError=false;
      this.userform.patchValue({
        FromCrypto : "BSC",
        ToCrypto : "ETH"
      })
      this.toChain = "ETH";
      this.isSelected="BSC";
      sessionStorage.setItem('toChain' , "ETH")
    } else {
      this.walletConnect = true;
      this.bscSwap=false;
      this.ethSwap=false;
      this.ftmSwap = false;
      this.insuffBalError=false;
      this.userform.patchValue({
        FromCrypto : "BSC",
        ToCrypto : "ETH"
      })
      this.toChain = "ETH";
      this.isSelected="BSC";
      sessionStorage.setItem('toChain' , "ETH")
    }

    if(this.isDeviceMobile == true){
      if(sessionStorage.getItem('chainId') == this.networnVersion){
          this.bscSwap = true;
          this.walletConnect = false;
          this.ethSwap= false;
          this.ftmSwap=false;
          this.insuffBalError=false;
        } else if(sessionStorage.getItem('chainId') == "3"){
          this.bscSwap = false;
          this.walletConnect = false;
          this.ftmSwap=false;
          this.ethSwap= true;
          this.insuffBalError=false;
        }else if(sessionStorage.getItem('chainId') == "4002"){
          this.bscSwap = false;
          this.ftmSwap=true;
          this.walletConnect = false;
          this.ethSwap= false;
          this.insuffBalError=false;
        }
         else{
          this.bscSwap = false;
          this.ftmSwap=false;
          this.walletConnect = true;
          this.ethSwap= false;
          this.insuffBalError=false;
        }
    }
   }, 2000);
  }
 

  //Form
  insuffBalError=false;
  insuffVAultError=false;
  getFromValue(value:any){
    console.log("toChain",this.toChain)
    if(value == 0 || value == ""){
      this.toster.info("Enter Value");
      this.userform.patchValue({
        to:""
      })
    } 
    // else{
      if(this.toChain == "BSC"){
        // for BSC
        let fromVal = parseFloat(value);
        this.loading=true;
        this.userform.patchValue({
          to: "0"
        })

        this.swapservice.ethToBscConvert(fromVal,this.tokenSelected).subscribe((result: any) => {
          this.notSupported = !result.status
          console.log("notSupported",this.notSupported)

          this.userform.patchValue({
            to: this.decimalpipe.transform(result.output, '1.2-6')
          })
          this.loading=false;
        })
  
      } else if(this.toChain == "ETH"){
        // for ETH
        let fromVal = parseFloat(value);
        this.loading=true;
        this.userform.patchValue({
          to: "0"
        })
        this.swapservice.bscToEthConvert(fromVal,this.tokenSelected).subscribe((result: any) => {    // ETH to BSC Convert
        // console.log("ETH TO BSC =  ", result / Math.pow(10, 18));
        this.notSupported = !result.status
        console.log(result.status)

        console.log("notSupported",this.notSupported)
        this.userform.patchValue({
          to: this.decimalpipe.transform(result.output , '1.2-6') 
        })
        this.loading=false;
        })
      } else if(this.toChain == "FTM"){
        // for FTM
        let fromVal = parseFloat(value);
        this.loading=true;
        this.userform.patchValue({
          to: "0"
        })
        this.swapservice.bscToFtmConvert(fromVal,this.tokenSelected).subscribe((result: any) => {    // ETH to BSC Convert
          this.notSupported = !result.status
          if(this.notSupported == true) {
            this.bscSwap = false;
            this.ftmSwap=false;
            this.walletConnect = false;
            this.ethSwap= false;
            this.insuffBalError=false;
            this.insuffVAultError = false;
          }

          // console.log("ETH TO BSC =  ", result / Math.pow(10, 18));
        this.userform.patchValue({
          to: this.decimalpipe.transform(result.output , '1.2-6') 
        })
        this.loading=false;
        })
      }

      if (sessionStorage.getItem('account_BSC')) {
        let fromVal = parseFloat(value)
        console.log("value",fromVal,value)
        this.currentWalletBalance = sessionStorage.getItem('bscBalance');
        this.vaultBalance = sessionStorage.getItem('ETH_vault_balance')
        if (fromVal <= parseFloat(this.currentWalletBalance) && fromVal<= parseFloat(this.vaultBalance) ) {
          this.insuffBalError = false;
          this.walletConnect = false;
          this.bscSwap = true;
          this.ethSwap=false;
          this.ftmSwap = false;
          this.insuffVAultError = false;
        } else {
          if(fromVal> parseFloat(this.vaultBalance)){
            this.insuffVAultError = true;
            this.insuffBalError = false;
          }else{
            this.insuffBalError = true;
            this.insuffVAultError = false;
          }
          console.log("bbb")
          this.walletConnect = false;
          this.bscSwap = false;
          this.ethSwap=false;
          this.ftmSwap = false;
        }
      } else if (sessionStorage.getItem('account_ETH')) {
        let fromVal = parseFloat(value)
        this.currentWalletBalance = sessionStorage.getItem('ethBalance');
        this.vaultBalance = sessionStorage.getItem('BSC_vault_balance')
        if (fromVal <= parseFloat(this.currentWalletBalance)  && fromVal<= parseFloat(this.vaultBalance)  ) {
          this.insuffBalError = false;
          this.walletConnect = false;
          this.bscSwap = false;
          this.ftmSwap = false;
          this.ethSwap=true;
          this.insuffVAultError = false;
        }else {
          if(fromVal> parseFloat(this.vaultBalance)){
            this.insuffVAultError = true;
            this.insuffBalError = false;
          }else{
            this.insuffBalError = true;
            this.insuffVAultError = false;
          }
          console.log("aaa")
          this.walletConnect = false;
          this.bscSwap = false;
          this.ftmSwap = false;
          this.ethSwap=false;
        }
      } else if (sessionStorage.getItem('account_FTM')) {
        let fromVal = parseFloat(value)
        this.currentWalletBalance = sessionStorage.getItem('ftmBalance');
        this.vaultBalance = sessionStorage.getItem('BSC_vault_balance')
        if (fromVal <= parseFloat(this.currentWalletBalance)  && fromVal<= parseFloat(this.vaultBalance)  ) {
          this.insuffBalError = false;
          this.walletConnect = false;
          this.bscSwap = false;
          this.ethSwap=false;
          this.ftmSwap = true;
          this.insuffVAultError = false;
        }else {
          if(fromVal> parseFloat(this.vaultBalance)){
            this.insuffVAultError = true;
            this.insuffBalError = false;
          }else{
            this.insuffBalError = true;
            this.insuffVAultError = false;
          }
          console.log("aaa")
          this.walletConnect = false;
          this.bscSwap = false;
          this.ethSwap=false;
          this.ftmSwap = false;
        }
      }
      

    // }
  }


  isSelected:any;
  getFrom(value: any) {
      if (value == "BSC") {
        this.isSelected = "BSC";
      this.userform.patchValue({
        FromCrypto: "BSC"
      })
      this.userform.patchValue({
        ToCrypto: "ETH"
      })
      this.allCryptoList1 = [
        // { id: 4, names: 'BSC', logo: 'assets/images/bsclogo.png' },
        { id: 5, names: 'ETH', logo: 'assets/images/ethlogo.png' },
        { id: 6, names: 'FTM', logo: 'assets/images/ftm.png' },
      ];
      this.toChain = "ETH"
      sessionStorage.setItem('toChain' , "ETH")
      this.getFromValue(this.userform.controls.from.value);    
    } else if(value=='ETH') {
      this.isSelected = "ETH";
      this.userform.patchValue({
        FromCrypto: "ETH"
      })
      this.userform.patchValue({
        ToCrypto: "BSC"
      })
      this.allCryptoList1 = [
        { id: 4, names: 'BSC', logo: 'assets/images/bsclogo.png' },
        // { id: 5, names: 'ETH', logo: 'assets/images/ethlogo.png' },
        // { id: 6, names: 'FTM', logo: 'assets/images/ftm.png' },
      ];
      this.toChain= "BSC"
      sessionStorage.setItem('toChain' , "BSC")
      this.getFromValue(this.userform.controls.from.value)
    }
    else if(value=='FTM') {
      this.isSelected = "FTM";
      this.userform.patchValue({
        FromCrypto: "FTM"
      })
      this.userform.patchValue({
        ToCrypto: "BSC"
      })
      this.allCryptoList1 = [
        { id: 4, names: 'BSC', logo: 'assets/images/bsclogo.png' },
        // { id: 5, names: 'ETH', logo: 'assets/images/ethlogo.png' },
        // { id: 6, names: 'FTM', logo: 'assets/images/ftm.png' },
      ];
      this.toChain= "BSC"
      sessionStorage.setItem('toChain' , "BSC")
      this.getFromValue(this.userform.controls.from.value)
    }
    // console.log("You have selected =" , this.isSelected);
    
  }

  getTo(value:any){
    if (value == "BSC") {
      this.toChain="BSC"
      sessionStorage.setItem('toChain' , "BSC")
      // this.userform.patchValue({
      //   FromCrypto: "ETH"
      // })
      this.userform.patchValue({
        ToCrypto: "BSC"
      })
      this.getFromValue(this.userform.controls.from.value)
    } else if(value =="ETH"){
      this.toChain="ETH"
      sessionStorage.setItem('toChain' , "ETH")
      // this.userform.patchValue({
      //   FromCrypto: "BSC"
      // })
      this.userform.patchValue({
        ToCrypto: "ETH"
      })
      this.getFromValue(this.userform.controls.from.value)
    } else if(value =="FTM"){
      this.toChain="FTM"
      sessionStorage.setItem('toChain' , "FTM")
      // this.userform.patchValue({
      //   FromCrypto: "BSC"
      // })
      this.userform.patchValue({
        ToCrypto: "FTM"
      })
      this.getFromValue(this.userform.controls.from.value)
    }
  }

  selectToken(value:any){
    if (value == "CATOSHI") {
    this.tokenSelected = "CAT";
    sessionStorage.setItem('tokenSelected' ,'CATOSHI' );


    this.userform.patchValue({
      tokenList: "CATOSHI"
    })
  } else if (value == "SHIH") {
    this.tokenSelected = "SHIH";
    sessionStorage.setItem('tokenSelected' ,'SHIH' );


    this.userform.patchValue({
      tokenList: "SHIH"
    })
  } else if (value == "DOGEX") {
    this.tokenSelected = "DOG";
    sessionStorage.setItem('tokenSelected' ,'DOGEX' );

    this.userform.patchValue({
      tokenList: "DOGEX"
    })
  }
  location.reload();

  } 

  tokenAbi={};
 currentWalletBalance:any;
  async swapBSC(){
    if(this.userform.controls.from.value){
      // const ci = localStorage.getItem('walletconnect')
      // const isMobileWalletConnected = ci ? JSON.parse(ci).connected : false
      if((sessionStorage.getItem('account_BSC') && this.isSelected == "BSC")){
        // alert("swap bsc .............");
        // let fromVal = BigInt(this.userform.value.from + '000000000000000000');
        // let connector;
        // if (isMobileWalletConnected) {
        //   connector = window.connector;
        // }else{
        //   connector = this.web3.eth;
        // }


          this.toster.warning('Please don\'t refresh, transaction is processing.');
          this.loading=true;
          let userAddress = sessionStorage.getItem('account_BSC');


          this.swapservice.checkBSCAllowance(this.userform.controls.from.value,userAddress,this.tokenSelected).subscribe(async(result:any)=>{
            // console.log(result);
            this.response = result.response
            if(!this.response) {
              await this.BSCApproveAndSwap()
            }
            else {
              await this.BSCOnlySwap()
            }
          })
        } else{
          this.toster.error("Connect to "+this.isSelected+" Network")
        }
      } else{
        this.toster.info("Enter Value")
      }
  }

  async BSCApproveAndSwap(){

          this.tokenAbi = {};
          this.tokenAbi = this.contractAddressResponse.tokenAbi["BSC"];
          let bscContractAddress = this.contractAddressResponse.TokenAddress["BSC"];
          let bridgeContractAddress = this.contractAddressResponse.bridgeAddress["BSC"];
          this.swapservice.getBSCbridgeFee(this.tokenSelected, this.toChain).subscribe((result:any)=>{
            // console.log(result);
            this.bscBridgeFee = result.bridgeFees
            this.decimal = result.decimal;
      
            console.log("bridge fees",this.bscBridgeFee)
          })

          console.log("bscContractAddress",bscContractAddress)
          let userAddress = sessionStorage.getItem('account_BSC');
            const data = {
              // amount : BigInt(this.userform.controls.from.value * Math.pow(10,18)),
              amount : BigInt(155223232222222222222222222222),
            }

            let instance = new this.web3.eth.Contract(
              this.tokenAbi,
              bscContractAddress
            );
            const gasPrice = await this.web3.eth.getGasPrice(); 
            this.web3.eth.sendTransaction({
              from: userAddress,
              to: bscContractAddress,
              value: 0 ,
              gasPrice : gasPrice,
              data: instance.methods.approve(bridgeContractAddress,data.amount).encodeABI()
            }).then(async(res:any) => {

            this.tokenAbi = {};
            this.tokenAbi = this.contractAddressResponse.bridgeAbi["BSC"];
            let bscContractAddress = this.contractAddressResponse.bridgeAddress["BSC"];
            console.log("bscContractAddress",bscContractAddress)
            let userAddress = sessionStorage.getItem('account_BSC');
              const data = {
                // amount : BigInt(this.userform.controls.from.value * Math.pow(10,18)),
                amount: BigInt(Math.floor((this.userform.controls.from.value ) * Math.pow(10,9))) * BigInt(Math.pow(10,this.decimal-9)),
              }
              console.log("amount",data.amount)


              let instance = new this.web3.eth.Contract(
                this.tokenAbi,
                bscContractAddress
              );
              let encodeABI:any
              if(this.toChain =='ETH') {
                encodeABI = instance.methods.swap(data.amount,1).encodeABI()
              } else if (this.toChain == 'FTM'){
                encodeABI = instance.methods.swap(data.amount,250).encodeABI()
              }
              const gasPrice = await this.web3.eth.getGasPrice(); 
              let self = this
              this.web3.eth.sendTransaction({
                from: userAddress,
                to: bscContractAddress,
                value: this.web3.utils.toHex(this.bscBridgeFee) ,
                gasPrice : gasPrice,
                data: encodeABI
              },function(error:any,hash:any){
              // ).then((res:any) => {
                  let transactionHash =hash;  
                  let currentTimeStamp = new Date().toISOString();
                  self.swapservice.bscSwap(transactionHash , currentTimeStamp , parseFloat(self.userform.controls.from.value),self.tokenSelected,self.toChain).subscribe((result:any)=>{
                    // console.log("swap result = " , result);
                    self.isGetWalletBal=true;
                    self.check_get_Balance();
                    if(result.status == true){
                      self.toster.success(result.message);
                    } else{
                      self.toster.error(result.message);
                    }
                    self.loading=false;
                    //For Clear both Input Type boxes
                    self.userform.patchValue({
                      from: 0
                    })
                    self.userform.patchValue({
                      to: 0
                    })
                  })
                }).catch((err:any) => {
                  this.toster.error(err.message);
                  this.loading=false;
                });
            });
      
  }

  async BSCOnlySwap() {
            this.tokenAbi = {}; 
            this.tokenAbi = this.contractAddressResponse.bridgeAbi["BSC"];
            let bscContractAddress = this.contractAddressResponse.bridgeAddress["BSC"];
            console.log("bscContractAddress",bscContractAddress)
            this.swapservice.getBSCbridgeFee(this.tokenSelected, this.toChain).subscribe((result:any)=>{
              // console.log(result);
              this.bscBridgeFee = result.bridgeFees
              this.decimal = result.decimal;
        
              console.log("bridge fees",this.bscBridgeFee)
            })

            
            let userAddress = sessionStorage.getItem('account_BSC');
              

              let instance = new this.web3.eth.Contract(
                this.tokenAbi,
                bscContractAddress
              );
              const data = {
                // amount : BigInt(this.userform.controls.from.value * Math.pow(10,18)),
                amount: BigInt(Math.floor((this.userform.controls.from.value ) * Math.pow(10,9))) * BigInt(Math.pow(10,this.decimal-9)),
                
              }
              console.log("amount",data.amount, Math.pow(10,this.decimal))

              let encodeABI:any
              if(this.toChain =='ETH') {
                encodeABI = instance.methods.swap(data.amount,1).encodeABI()
              } else if (this.toChain == 'FTM'){
                encodeABI = instance.methods.swap(data.amount,250).encodeABI()
              }
              const gasPrice = await this.web3.eth.getGasPrice(); 
              let self = this
              this.web3.eth.sendTransaction({
                from: userAddress,
                to: bscContractAddress,
                value: this.web3.utils.toHex(this.bscBridgeFee) ,
                gasPrice : gasPrice,
                data: encodeABI
              },function(error:any,hash:any){
              // ).then((res:any) => {
                  let transactionHash = hash;  
                  let currentTimeStamp = new Date().toISOString();
                  self.swapservice.bscSwap(transactionHash , currentTimeStamp , parseFloat(self.userform.controls.from.value),self.tokenSelected,self.toChain).subscribe((result:any)=>{
                    // console.log("swap result = " , result);
                    self.isGetWalletBal=true;
                    self.check_get_Balance();
                    if(result.status == true){
                      self.toster.success(result.message);
                    } else{
                      self.toster.error(result.message);
                    }
                    self.loading=false;
                    //For Clear both Input Type boxes
                    self.userform.patchValue({
                      from: 0
                    })
                    self.userform.patchValue({
                      to: 0
                    })
                  })
                }).catch((err:any) => {
                  this.toster.error(err.message);
                  this.loading=false;
                });
    
  }
 
  async swapETH(){
    if(this.userform.controls.from.value){
      if(sessionStorage.getItem('account_ETH') && this.isSelected == "ETH"){
        // let fromVal = BigInt(this.userform.value.from + '000000000000000000');
        this.loading=true;
        this.toster.warning('Please don\'t refresh, transaction is processing.');
        let userAddress = sessionStorage.getItem('account_ETH');

        this.swapservice.checkETHAllowance(this.userform.controls.from.value,userAddress,this.tokenSelected).subscribe(async(result:any)=>{
          // console.log(result);
          this.response = result.response
          if(!this.response) {
            await this.ETHApproveAndSwap()
          }
          else {
            await this.ETHOnlySwap()
          }
        })
      } else{
        this.toster.error("Connect to "+this.isSelected+" Network")
      }
    } else{
      this.toster.info("Enter Value")
    }
  }

  async ETHApproveAndSwap(){

    this.tokenAbi = {};
    this.tokenAbi = this.contractAddressResponse.tokenAbi["ETH"];
    let ethContractAddress = this.contractAddressResponse.TokenAddress["ETH"];
    let bridgeContractAddress = this.contractAddressResponse.bridgeAddress["ETH"];
    console.log("ethContractAddress",ethContractAddress)
    let userAddress = sessionStorage.getItem('account_ETH');
      const data = {
        // amount : BigInt(this.userform.controls.from.value * Math.pow(10,18)),
        amount : BigInt(155223232222222222222222222222),
      }

      let instance = new this.web3.eth.Contract(
        this.tokenAbi,
        ethContractAddress
      );
      const gasPrice = await this.web3.eth.getGasPrice(); 
      this.web3.eth.sendTransaction({
        from: userAddress,
        to: ethContractAddress,
        value: 0 ,
        gasPrice : gasPrice,
        data: instance.methods.approve(bridgeContractAddress,data.amount).encodeABI()
      }).then(async(res:any) => {
        this.tokenAbi = {};
        this.tokenAbi = this.contractAddressResponse.bridgeAbi["ETH"];
        let ethContractAddress = this.contractAddressResponse.bridgeAddress["ETH"];
            // console.log("bscContractAddress",bscContractAddress)
        let userAddress = sessionStorage.getItem('account_ETH');
        const data = {
          amount: BigInt(Math.floor((this.userform.controls.from.value ) * Math.pow(10,9))) * BigInt(Math.pow(10,this.decimal-9)),
        }
        console.log("amount",data.amount,Math.pow(10,this.decimal))

        let instance = new this.web3.eth.Contract(
          this.tokenAbi,
          ethContractAddress
        );
        const gasPrice = await this.web3.eth.getGasPrice();
        let self = this
        this.web3.eth.sendTransaction({
          from: userAddress,
          to: ethContractAddress,
          value: this.web3.utils.toHex(this.ethBridgeFee) ,
          gasPrice : gasPrice,
          data: instance.methods.swap(data.amount,56).encodeABI()
        },function(error:any,hash:any){
        // ).then((res: any) => {
          let transactionHash = hash;
          let currentTimeStamp = new Date().toISOString();
          self.swapservice.ethSwap(transactionHash , currentTimeStamp , parseFloat(self.userform.controls.from.value),self.tokenSelected).subscribe((result:any)=>{
            // console.log('final eth response = ',result);
            self.isGetWalletBal=true;
            self.check_get_Balance();
           if(result.status == true){
            self.toster.success(result.message);
           } else{
            self.toster.error(result.message);
           }

           self.loading=false;
            //For Clear both Input Type boxes
            self.userform.patchValue({
              from: 0
            })
            self.userform.patchValue({
              to: 0
            })
          })
        }).catch((err: any) => {
          this.toster.error(err.message);
          this.loading=false;
        });
            
      });
  }

  async ETHOnlySwap(){
    this.tokenAbi = {};
    this.tokenAbi = this.contractAddressResponse.bridgeAbi["ETH"];
    let ethContractAddress = this.contractAddressResponse.bridgeAddress["ETH"];
        // console.log("bscContractAddress",bscContractAddress)
    let userAddress = sessionStorage.getItem('account_ETH');
    const data = {
      amount: BigInt(Math.floor((this.userform.controls.from.value ) * Math.pow(10,9))) * BigInt(Math.pow(10,this.decimal-9)),
    }
    // console.log("sss",this.userform.controls.from.value)
    // console.log("ddd",(this.userform.controls.from.value ) * Math.pow(10,this.decimal))
    // console.log("amount",data.amount,Math.pow(10,this.decimal))

    let instance = new this.web3.eth.Contract(
      this.tokenAbi,
      ethContractAddress
    );
    const gasPrice = await this.web3.eth.getGasPrice();
    let self = this
    this.web3.eth.sendTransaction({
      from: userAddress,
      to: ethContractAddress,
      value: this.web3.utils.toHex(this.ethBridgeFee) ,
      gasPrice : gasPrice,
      data: instance.methods.swap(data.amount,56).encodeABI()
    },function(error:any,hash:any){

    // .then((res: any) => {
      console.log(hash)
      let transactionHash = hash;
      let currentTimeStamp = new Date().toISOString();
      self.swapservice.ethSwap(transactionHash , currentTimeStamp , parseFloat(self.userform.controls.from.value),self.tokenSelected).subscribe((result:any)=>{
        // console.log('final eth response = ',result);
        self.isGetWalletBal=true;
        self.check_get_Balance();
       if(result.status == true){
        self.toster.success(result.message);
       } else{
        self.toster.error(result.message);
       }

       self.loading=false;
        //For Clear both Input Type boxes
        self.userform.patchValue({
          from: 0
        })
        self.userform.patchValue({
          to: 0
        })
      })
    }).catch((err: any) => {
      this.toster.error(err.message);
      this.loading=false;
    });
  }

 async swapFTM(){
    if(this.userform.controls.from.value){
      if(sessionStorage.getItem('account_FTM') && this.isSelected == "FTM"){
        // let fromVal = BigInt(this.userform.value.from + '000000000000000000');
        this.loading=true;
        this.toster.warning('Please don\'t refresh, transaction is processing.');
        let userAddress = sessionStorage.getItem('account_FTM');

        this.swapservice.checkFTMAllowance(this.userform.controls.from.value,userAddress,this.tokenSelected).subscribe(async(result:any)=>{
          // console.log(result);
          this.response = result.response
          if(!this.response) {
            await this.FTMApproveAndSwap()
          }
          else {
            await this.FTMOnlySwap()
          }
        })
      } else{
        this.toster.error("Connect to "+this.isSelected+" Network")
      }
    } else{
      this.toster.info("Enter Value")
    }
  }

  async FTMApproveAndSwap(){

    this.tokenAbi = {};
    this.tokenAbi = this.contractAddressResponse.tokenAbi["FTM"];
    let ftmContractAddress = this.contractAddressResponse.TokenAddress["FTM"];
    let bridgeContractAddress = this.contractAddressResponse.bridgeAddress["FTM"];
    console.log("ftmContractAddress",ftmContractAddress)
    let userAddress = sessionStorage.getItem('account_FTM');
      const data = {
        // amount : BigInt(this.userform.controls.from.value * Math.pow(10,18)),
        amount : BigInt(155223232222222222222222222222),
      }

      let instance = new this.web3.eth.Contract(
        this.tokenAbi,
        ftmContractAddress
      );
      const gasPrice = await this.web3.eth.getGasPrice(); 
      this.web3.eth.sendTransaction({
        from: userAddress,
        to: ftmContractAddress,
        value: 0 ,
        gasPrice : gasPrice,
        data: instance.methods.approve(bridgeContractAddress,data.amount).encodeABI()
      }).then(async(res:any) => {
        this.tokenAbi = {};
        this.tokenAbi = this.contractAddressResponse.bridgeAbi["FTM"];
        let ftmContractAddress = this.contractAddressResponse.bridgeAddress["FTM"];
            // console.log("bscContractAddress",bscContractAddress)
        let userAddress = sessionStorage.getItem('account_FTM');
        const data = {
          amount: BigInt(Math.floor((this.userform.controls.from.value ) * Math.pow(10,9))) * BigInt(Math.pow(10,this.decimal-9)),
        }
        console.log("amount",data.amount)

        let instance = new this.web3.eth.Contract(
          this.tokenAbi,
          ftmContractAddress
        );
        const gasPrice = await this.web3.eth.getGasPrice();
        let self = this
        this.web3.eth.sendTransaction({
          from: userAddress,
          to: ftmContractAddress,
          value: this.web3.utils.toHex(this.ftmBridgeFee) ,
          gasPrice : gasPrice,
          data: instance.methods.swap(data.amount,56).encodeABI()
        },function(error:any,hash:any){
        // ).then((res: any) => {
          let transactionHash = hash;
          let currentTimeStamp = new Date().toISOString();
          self.swapservice.ftmSwap(transactionHash , currentTimeStamp , parseFloat(self.userform.controls.from.value),self.tokenSelected).subscribe((result:any)=>{
            // console.log('final eth response = ',result);
            self.isGetWalletBal=true;
            self.check_get_Balance();
           if(result.status == true){
            self.toster.success(result.message);
           } else{
            self.toster.error(result.message);
           }

           self.loading=false;
            //For Clear both Input Type boxes
            self.userform.patchValue({
              from: 0
            })
            self.userform.patchValue({
              to: 0
            })
          })
        }).catch((err: any) => {
          this.toster.error(err.message);
          this.loading=false;
        });
            
      });
  }

  async FTMOnlySwap(){
    this.tokenAbi = {};
    this.tokenAbi = this.contractAddressResponse.bridgeAbi["FTM"];
    let ftmContractAddress = this.contractAddressResponse.bridgeAddress["FTM"];
        // console.log("bscContractAddress",bscContractAddress)
    let userAddress = sessionStorage.getItem('account_FTM');
    const data = {
      amount: BigInt(Math.floor((this.userform.controls.from.value ) * Math.pow(10,9))) * BigInt(Math.pow(10,this.decimal-9)),
    }
    console.log("amount",data.amount)
    let instance = new this.web3.eth.Contract(
      this.tokenAbi,
      ftmContractAddress
    );
    const gasPrice = await this.web3.eth.getGasPrice();
    let self = this
    this.web3.eth.sendTransaction({
      from: userAddress,
      to: ftmContractAddress,
      value: this.web3.utils.toHex(this.ethBridgeFee) ,
      gasPrice : gasPrice,
      data: instance.methods.swap(data.amount,56).encodeABI()
    },function(error:any,hash:any){

    // .then((res: any) => {
      console.log(hash)
      let transactionHash = hash;
      let currentTimeStamp = new Date().toISOString();
      self.swapservice.ftmSwap(transactionHash , currentTimeStamp , parseFloat(self.userform.controls.from.value),self.tokenSelected).subscribe((result:any)=>{
        // console.log('final eth response = ',result);
        self.isGetWalletBal=true;
        self.check_get_Balance();
       if(result.status == true){
        self.toster.success(result.message);
       } else{
        self.toster.error(result.message);
       }

       self.loading=false;
        //For Clear both Input Type boxes
        self.userform.patchValue({
          from: 0
        })
        self.userform.patchValue({
          to: 0
        })
      })
    }).catch((err: any) => {
      this.toster.error(err.message);
      this.loading=false;
    });
  }

  connectMetamask() {
    // this.isDeviceMobile=true
    this.metamask.disconnectAllWallet();
    if(this.isDeviceMobile){
      this.walletProvider();
      // this.connectWalletHandler();
    }
    // else if (localStorage.getItem('walletconnect')){
    //   this.walletProvider();
    // }
    else{      
      this.metamask.initMetaMask();
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
    } else if(provider.chainId == "3"){
      sessionStorage.setItem('account', accounts[0]);
      sessionStorage.setItem('chainId', provider.chainId)
      sessionStorage.setItem('account_ETH_trustWallet', accounts[0]);
    }else if(provider.chainId == this.ftmChainId){
      sessionStorage.setItem('account', accounts[0]);
      sessionStorage.setItem('chainId', provider.chainId)
      sessionStorage.setItem('account_FTM', accounts[0]);
    }
     else if(provider.chainId){
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
  getMaxValue(){
    // if(window.ethereum?.networkVersion == "97" || window.ethereum?.networkVersion == "120"){
    if(window.ethereum?.networkVersion == sessionStorage.getItem('ethChainId') ){
      let a:any = sessionStorage.getItem('ethBalance');
      let bscBalance = a 
      let walletBal= bscBalance.toString();
      this.userform.patchValue({
        from: walletBal
      })      
    } else if(window.ethereum?.networkVersion == sessionStorage.getItem('bscChainId')){
      let a:any = sessionStorage.getItem('bscBalance');
      let ethBalance = a 
      let walletBal= ethBalance.toString();
      console.log('walletBalance',walletBal)
      this.userform.patchValue({
        from: walletBal
      })  
    // }
  }
  }
//   connectWalletHandler = () => {
//     // Create a connector
//     window.connector = new WalletConnect({
//         bridge: "https://bridge.walletconnect.org", // Required
//         qrcodeModal: QRCodeModal,
//         qrcodeModalOptions: {
//           mobileLinks: [
//             "metamask",
//             "trust",
//           ],
//         },
//     });
//     // setConnector(connector);
//     // Check if connection is already established
//     if (!window.connector.connected) {
//         // create new session
//         window.connector.createSession();
//     }
//     this.web3 = new Web3( window.connector);
//     // Subscribe to connection events
//     window.connector.on("connect", (error: any, payload:any) => {
//         if (error) {
//             throw error;
//         }

//         // Get provided accounts and chainId
//         const { accounts, chainId } = payload.params[0];
        
//     if(chainId == "97"){
//       sessionStorage.setItem('account', accounts[0]);
//       sessionStorage.setItem('chainId', chainId)
//       sessionStorage.setItem('account_BSC', accounts[0]);
//     } else if(chainId == "3"){
//       sessionStorage.setItem('account', accounts[0]);
//       sessionStorage.setItem('chainId', chainId)
//       sessionStorage.setItem('account_ETH_trustWallet', accounts[0]);
//     } else if(chainId){
//       sessionStorage.setItem('account_ETH_trustWallet_wrongNetwork' , 'account_ETH_trustWallet_wrongNetwork')
//     } else{
//       sessionStorage.setItem('account_ETH_trustWallet_notConnected' , 'account_ETH_trustWallet_notConnected')
//     }

//       // this.connectStatus = true;
//       if (!localStorage.getItem('walletConnected')) {
//         localStorage.setItem('walletConnected', 'success');
//         location.reload();
//       }
//     });

//     window.connector.on("session_update", (error:any, payload:any) => {
//         if (error) {
//             throw error;
//         }

//         // Get updated accounts and chainId
//         const { accounts, chainId } = payload.params[0];
//         console.log('session_update:',accounts)
//     });

//     window.connector.on("disconnect", (error:any, payload:any) => {
//         if (error) {
//             throw error;
//         }

//         // Delete connector
//         console.log('onDesconnect:',payload)
//         sessionStorage.removeItem('account');
//         sessionStorage.removeItem('chainId');
//         sessionStorage.removeItem('account_ETH_trustWallet');
//         sessionStorage.removeItem('account_ETH_trustWallet_notConnected');
//         sessionStorage.removeItem('account_ETH_trustWallet_wrongNetwork')
//         location.reload();
//     });
// }
}
