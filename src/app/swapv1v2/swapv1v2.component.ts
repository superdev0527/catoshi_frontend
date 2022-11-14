import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder,FormGroup,Validators,FormControl} from '@angular/forms';
import { MetamaskService } from '../services/metamask.service';
import { DeviceDetectorService } from 'ngx-device-detector';
// import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from 'ngx-toastr';
import { SwapV1V2Service } from './swapv1v2.service';
import { appConfig } from '../config';
import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';

declare let window: any;
@Component({
  selector: 'app-swapv1v2',
  templateUrl: './swapv1v2.component.html',
  styleUrls: ['./swapv1v2.component.scss']
})
export class SwapV1V2Component implements OnInit {
  public loading = false;
  //JSON For AllCryptocurrencies List
  allCryptoList = [
    { id: 1, name: 'V1', logo: 'assets/images/ethlogo.png' },
    // { id: 2, name: 'ETH', logo: 'assets/images/ethlogo.png' },
  ];
  allCryptoList1 = [
    { id: 3, names: 'V2', logo: 'assets/images/ethlogo.png' },
    // { id: 4, names: 'ETH', logo: 'assets/images/ethlogo.png' },
  ];

  //FROM and TO 
   userform = new FormGroup({
    from: new FormControl('', [Validators.required]),
    to: new FormControl(''),
    FromCrypto: new FormControl(''),
    ToCrypto: new FormControl(''),
    });
  constructor(private metamask:MetamaskService,
    private deviceService: DeviceDetectorService,
    private toster:ToastrService,
    // private spinner: NgxSpinnerService,
    private swapservice:SwapV1V2Service,
    private decimalpipe : DecimalPipe) {
    const isMobile = this.deviceService.isMobile();
    const isTablet = this.deviceService.isTablet();
    if (isMobile) {  this.isDeviceMobile = true;  }
    if (isTablet) {  this.isDeviceMobile = true;  }
   }

  isDeviceMobile=false;
  token:any;
  web3: any;
  bscSwap:any;
  ethSwap:any;
  walletConnect:any;
  tempWeb3_eth:any;
  tempWeb3_bsc:any;
  bscBridgeFee:any;
  ethBridgeFee:any;
  isGetWalletBal=false;
  isTrustWalletConnected=false;
  walletConnectApproveRes=false;
  walletConnectErrorRes=false;

  transactionHashAfterTrans = "";
  swapEnable = false;


   walletConnectUserAddress:any = sessionStorage.getItem('account_ETH_trustWallet');


  ngOnInit(): void {  
    sessionStorage.setItem('swapPage' , "swapv1v2")
    // localStorage.clear();
    //   sessionStorage.clear(); 
      this.isGetWalletBal=true;

      if(!this.isDeviceMobile){
    this.metamask.checkMetaMaskInitial();
    this.metamask.initMetaMask();
    
    // if (typeof window.web3 !== 'undefined') {
    //   this.web3 = new Web3(window.web3.currentProvider);
    // } else {
    //   //this.web3 = new Web3.providers.HttpProvider(appConfig.web3ProviderUrl);
    //   this.web3 = new Web3.providers.HttpProvider('http://localhost:4200');
    // }


    if (window.ethereum === undefined) {
      this.toster.error('Non-Ethereum browser detected. Install MetaMask');
    } else {
      if (typeof window.ethereum !== 'undefined') {
        //this.web3 = window.ethereum;
        this.web3 = new Web3(window.ethereum);
        this.swapEnable = true;
      } else {
        this.web3 = new Web3.providers.HttpProvider('http://localhost:4200');
      }
    }
  }else{
    // if(localStorage.getItem('walletconnect')){
      // this.metamask.walletProvider();
      this.walletProvider();
      // this.getweb3();
      this.metamask.connectWalletHandler();
    // }

  }



    this.get_set_Accounts()
    
    }

    

  ngDoCheck() {
  //  this.loading=true
   this.get_set_Accounts();
  }

  get_set_Accounts(){
    if (!this.isDeviceMobile && window.ethereum && window.ethereum._state && window.ethereum._state.accounts && window.ethereum._state.accounts.length) {
      if (window.ethereum._state.accounts[0] === undefined) { window.ethereum
        this.metamask.metaMaskUpdate();
      } else {
        this.metamask.metaMaskUpdated();
        if(window.ethereum?.networkVersion == "1"){
          sessionStorage.setItem('account_ropsten', window.ethereum._state.accounts[0]);
        } 
      }
    } 
    // else if(localStorage.getItem('-walletlink:https://www.walletlink.org:Addresses')){
    // }
    else  {
      if (this.isDeviceMobile && sessionStorage.getItem('account')){
        let address = sessionStorage.getItem('account');
        if( sessionStorage.getItem('account_ETH_trustWallet') != undefined && sessionStorage.getItem('account_ETH_trustWallet') != null ){
          // this.isTrustWalletConnected=true;
        }else{
          sessionStorage.removeItem("account_ETH_trustWallet");
        }
    }else{
      // sessionStorage.clear();
      // this.metamask.checkMetaMaskInitial();
      // this.metamask.initMetaMask();
    }
  }
 
  if(window.ethereum?.networkVersion == "1"){
  } else{
    sessionStorage.removeItem('account_ropsten');
    sessionStorage.removeItem('v1v2Balance')
    
    // sessionStorage.clear();
    // this.toster.warning("Please Select ETH or BSC Network")
  }

  this.check_get_Balance()
  }

    check_get_Balance(){  
    // GET Wallet Balance
    if(this.isGetWalletBal){
    if(sessionStorage.getItem('account_ropsten')){
      let bscWalletAddress:any = sessionStorage.getItem('account_ropsten');  
      let contractAdd:any = appConfig.contraceAddressV1;
      this.swapservice.getv1v2Balance(bscWalletAddress , contractAdd).subscribe((result: any) => {   //GET BSC BALANCE
        if(result.Tokens  == undefined){
          sessionStorage.setItem('v1v2Balance', "0");
          // console.log(result.Tokens)
          this.isGetWalletBal=false;
        } else{
          sessionStorage.setItem('v1v2Balance', result.Tokens);
          // console.log(result.Tokens)
          this.isGetWalletBal=false;
        }
      })
    } 
    if(sessionStorage.getItem('account_ETH_trustWallet')){
      let WalletAddress:any = sessionStorage.getItem('account_ETH_trustWallet');  
      let contractAdd:any = appConfig.contraceAddressV1;
      this.swapservice.getv1v2Balance(WalletAddress , contractAdd).subscribe((result: any) => {   //GET BSC BALANCE
        if(result.Tokens  == undefined){
          sessionStorage.setItem('ETH_trustWallet_balance', "0");
          // console.log(result.Tokens)
          this.isGetWalletBal=false;
        } else{
          sessionStorage.setItem('ETH_trustWallet_balance', result.Tokens);
          // console.log(result.Tokens)
          this.isGetWalletBal=false;
        }
      })
    } 
  }
  }


  ngAfterContentInit(){  
    this.loading=true;
    setTimeout(() => {
      this.loading=false;
      if(!this.isDeviceMobile){
      if (window.ethereum?.networkVersion == "1" && sessionStorage.getItem('account_ropsten')) {
        // this.bscSwap = false;
        this.swapEnable=true
        this.ethSwap = true;
        this.walletConnect = false;
        this.insuffBalError=false;
        this.userform.patchValue({
          FromCrypto : "V1",
          ToCrypto : "V2"
        })
        //this.isSelected="ETH";
      }
      else {
        this.walletConnect = true;
        // this.bscSwap=false;
        this.swapEnable=false;
        this.ethSwap=false;
        this.insuffBalError=false;
        this.userform.patchValue({
          FromCrypto : "V1",
          ToCrypto : "V2"
        })
        //this.isSelected="BSC";
      }
    }
    else{
      if(sessionStorage.getItem('account_ETH_trustWallet')){
        this.swapEnable=false;
        this.ethSwap = false;
        this.walletConnect = false;
        this.insuffBalError=false;
        this.isTrustWalletConnected = true;
        this.userform.patchValue({
          FromCrypto : "V1",
          ToCrypto : "V2"
        })
      }else{
        this.walletConnect = true;
        // this.bscSwap=false;
        this.swapEnable=false;
        this.ethSwap=false;
        this.insuffBalError=false;
        this.isTrustWalletConnected = false;
        this.userform.patchValue({
          FromCrypto : "V1",
          ToCrypto : "V2"
        })
      }
    }
    }, 3000);

  }
 

  //Form
  insuffBalError=false;
 
  getFromValue(value:any){
    if(value == 0 || value == ""){
      this.toster.info("Enter Value");
      this.userform.patchValue({
        to:""
      })
    } 
    // else{
      
      this.userform.patchValue({
        to:  this.decimalpipe.transform(this.userform.controls.from.value, '1.2-2')
      })

      if (sessionStorage.getItem('v1v2Balance') && localStorage.getItem('networkStatus') == "right") {
        let fromVal = BigInt(value * Math.pow(10, 18));
        this.currentWalletBalance = sessionStorage.getItem('v1v2Balance');
        if (fromVal <= this.currentWalletBalance) {
          this.walletConnect = false;
          this.swapEnable = true;
          this.isTrustWalletConnected = false;
          this.insuffBalError = false
        } else {
          this.walletConnect = false;
          this.swapEnable = false;
          this.isTrustWalletConnected = false;
          this.insuffBalError = true
          console.log("ccc")

        }
      }  else if(sessionStorage.getItem('ETH_trustWallet_balance')){
        let fromVal = BigInt(value * Math.pow(10, 18));
        this.currentWalletBalance = sessionStorage.getItem('ETH_trustWallet_balance');
        if (fromVal <= parseInt(this.currentWalletBalance)) {
          this.walletConnect = false;
          this.swapEnable = false;
          this.isTrustWalletConnected = true;
          this.insuffBalError = false
        } else {
          this.walletConnect = false;
          this.swapEnable = false;
          this.isTrustWalletConnected = false;
          this.insuffBalError = true
          console.log("ddd")

        }
      }
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
      this.getFromValue(this.userform.controls.from.value);    
    } else {
      this.isSelected = "ETH";
      this.userform.patchValue({
        FromCrypto: "ETH"
      })
      this.userform.patchValue({
        ToCrypto: "BSC"
      })
      this.getFromValue(this.userform.controls.from.value)
    }
    // console.log("You have selected =" , this.isSelected);
    
  }

  getTo(value:any){
    if (value == "BSC") {
      this.userform.patchValue({
        FromCrypto: "ETH"
      })
      this.userform.patchValue({
        ToCrypto: "BSC"
      })
    } else {
      this.userform.patchValue({
        FromCrypto: "BSC"
      })
      this.userform.patchValue({
        ToCrypto: "ETH"
      })
    }
  }

 

  tokenAbi={};

 currentWalletBalance:any;
  async swapETH(){
    if(this.userform.controls.from.value){
      if(sessionStorage.getItem('account_ropsten')){
        let fromVal = BigInt(this.userform.value.from * Math.pow(10, 18));
          this.toster.warning('Please don\'t refresh, transaction is processing.');
          this.loading=true;
          //for approve method
          this.tokenAbi = {};
          this.tokenAbi = appConfig.tokenAddressV1;
          let EthcontractAddressV1 = appConfig.contraceAddressV1;
          let userAddress = sessionStorage.getItem('account_ropsten');
          const data = {
            spender: appConfig.contractAddressV1V2Approve,
            amount: window.web3.utils.toBN(this.userform.controls.from.value +'000000000000000000')//BigInt(this.userform.controls.from.value * Math.pow(10, 18)),
          }

          let instance = new this.web3.eth.Contract(
            this.tokenAbi,
            EthcontractAddressV1
          );
          const gasPrice = await this.web3.eth.getGasPrice(); 
          // console.log("Approve amount =  >", data.amount);
          this.web3.eth.sendTransaction({
            from: userAddress,
            to: EthcontractAddressV1,
            value: 0x0,
            gasPrice : gasPrice,
            data: instance.methods.approve(data.spender, data.amount).encodeABI()
          }).then(async (res: any) => {
            // console.log("approve response  == ", res);
            let transactionHashApprove = res.transactionHash;
            // console.log("your approve transaction hash is = ", transactionHashApprove);
            //for swap method
            if (transactionHashApprove.length > 0) {
                      this.toster.warning('Please don\'t refresh, transaction is processing.');
                      let migratetokentokenAbi = {};
                      migratetokentokenAbi = appConfig.tokenV1V2;
                      let migratetokenContractAddress = appConfig.contractAddressV1V2Approve;
                      let userAddress = sessionStorage.getItem('account_ropsten');
                      const data = {
                        amount: window.web3.utils.toBN(this.userform.controls.from.value + '000000000000000000')//BigInt(this.userform.controls.from.value * Math.pow(10, 18)),
                      }
                      
                      let migratetokeninstance = new this.web3.eth.Contract(
                        migratetokentokenAbi,
                        migratetokenContractAddress
                      );
                      const gasPrice = await this.web3.eth.getGasPrice();
                      // console.log("migration amount =  >", data.amount);
                      this.web3.eth.sendTransaction({
                        from: userAddress,
                        to: migratetokenContractAddress,
                        //value: this.web3.utils.toHex(this.ethBridgeFee) ,
                        gasPrice : gasPrice,
                        data: migratetokeninstance.methods.migratetoken(EthcontractAddressV1, data.amount).encodeABI()
                      }).then((res: any) => {
                        // console.log("swap response  == ", res);
                        let transactionHash = res.transactionHash;
                        this.transactionHashAfterTrans = res.transactionHash;
                        let button:any = document.getElementById("trbutton");
                        button.click();
                        // console.log("your swap transaction hash is = ", transactionHash);
                        this.swapservice.ethSwap(transactionHash).subscribe((result:any)=>{
                          // console.log('final eth response = ',result);
                          this.check_get_Balance();
                            this.toster.success(result.message);
                          this.loading=false;
                          //For Clear both Input Type boxes
                          setTimeout(() => {
                            this.userform.patchValue({
                              from: 0
                            })
                            this.userform.patchValue({
                              to: 0
                            })
                          }, 4000);
                        })
                      }).catch((err: any) => {
                        this.toster.error(err.message);
                        this.loading=false;
                      });
            } else {
              this.toster.error("Something went wrong");
              this.loading=false;
            }
          }).catch((err: any) => {
            this.toster.error(err.message);
            this.loading=false;
          });
            
      } else{
        this.toster.error("Connect to "+this.isSelected+" Network")
      }
    } else{
      this.toster.info("Enter Value")
    }
  }


  async swapETHOnWalletConnect(){
    if(this.userform.controls.from.value){
      if(sessionStorage.getItem('account_ETH_trustWallet')){
        // let fromVal = BigInt(this.userform.value.from * Math.pow(10, 18));
        //   this.toster.warning('Please don\'t refresh, transaction is processing.');
        //   this.loading=true;
          //for approve method
          this.tokenAbi = {};
          // this.web3= new Web3(window.web3.currentProvider);
          this.tokenAbi = appConfig.tokenAddressV1;
          let EthcontractAddressV1 = appConfig.contraceAddressV1;
          let userAddress = sessionStorage.getItem('account_ETH_trustWallet');
          const data = {
            spender: appConfig.contractAddressV1V2Approve,
            amount: BigInt(this.userform.controls.from.value * Math.pow(10, 18)),
          }

          let instance = new this.web3.eth.Contract(
            this.tokenAbi,
            EthcontractAddressV1
          );
          const gasPrice = await this.web3.eth.getGasPrice(); 
          window.connector.sendTransaction({
            from: userAddress,
            to: EthcontractAddressV1,
            value: 0x0,
            gasPrice : gasPrice,
            data: instance.methods.approve(data.spender, data.amount).encodeABI()
          }).then(async (res: any) => {
            // console.log("approve response  == ", res);
            this.walletConnectApproveRes = true;
            let transactionHashApprove = res.transactionHash;
            // console.log("your approve transaction hash is = ", transactionHashApprove);
            //for swap method
            if (transactionHashApprove.length > 0) {
                      this.toster.warning('Please don\'t refresh, transaction is processing.');
              let migratetokentokenAbi = {};
                      migratetokentokenAbi = appConfig.tokenV1V2;
                      let migratetokenContractAddress = appConfig.contractAddressV1V2Approve;
                      let userAddress = sessionStorage.getItem('account_ETH_trustWallet');
                      const data = {
                        amount: BigInt(this.userform.controls.from.value * Math.pow(10, 18)),
                      }
                      
                    let migratetokeninstance = new this.web3.eth.Contract(
                      migratetokentokenAbi,
                      migratetokenContractAddress
                    );
                      const gasPrice = await this.web3.eth.getGasPrice();
                      window.connector.sendTransaction({
                        from: userAddress,
                        to: migratetokenContractAddress,
                        //value: this.web3.utils.toHex(this.ethBridgeFee) ,
                        gasPrice : gasPrice,
                        data: migratetokeninstance.methods.migratetoken(EthcontractAddressV1, data.amount).encodeABI()
                      }).then((res: any) => {
                        // console.log("swap response  == ", res);
                        let transactionHash = res.transactionHash;
                        // console.log("your swap transaction hash is = ", transactionHash);
                        this.swapservice.ethSwap(transactionHash).subscribe((result:any)=>{
                          // console.log('final eth response = ',result);
                          this.check_get_Balance();
                          this.toster.success(result.message);
                          this.loading=false;
                          //For Clear both Input Type boxes
                          this.userform.patchValue({
                            from: 0
                          })
                          this.userform.patchValue({
                            to: 0
                          })
                        })
                      }).catch((err: any) => {
                        this.walletConnectErrorRes = true;
                        this.toster.error(err.message);
                        this.loading=false;
                      });
                      setTimeout(() => {
                        if(!this.walletConnectErrorRes){
                        this.swapservice.getTransactionByAddress(this.walletConnectUserAddress).subscribe(async (success:any) => {
                          let transactionHashApprove = success["result"][0];
                        let time = parseInt(transactionHashApprove?.timeStamp)
                        //if (new Date((time + 100) * 1000) > new Date()) {
                        // console.log("swap response  == ", transactionHashApprove.hash);
                        let transactionHash = transactionHashApprove?.hash;
                        this.transactionHashAfterTrans = transactionHash;
                        let button:any = document.getElementById("trbutton");
                        button.click();
                        // console.log("your swap transaction hash is = ", transactionHash);
                        this.swapservice.ethSwap(transactionHash).subscribe((result:any)=>{
                          // console.log('final eth response = ',result);
                          this.check_get_Balance();
                          this.toster.success(result.message);
                          this.loading=false;
                          //For Clear both Input Type boxes
                          this.userform.patchValue({
                            from: 0
                          })
                          this.userform.patchValue({
                            to: 0
                          })
                        })
                      //}
                    },(error)=>{
                      this.toster.error("Something went wrong");
                  this.loading=false;
                    })
                  }
                      }, 60 * 1000);
            } else {
              this.toster.error("Something went wrong");
              this.loading=false;
            }
          }).catch((err: any) => {
            this.toster.error(err.message);
            this.loading=false;
          });

          setTimeout(() => {
            if (!this.walletConnectApproveRes) {
              this.swapservice.getTransactionByAddress(this.walletConnectUserAddress).subscribe(async (success:any) => {
                let transactionHashApprove = success["result"][0];
                let time = parseInt(transactionHashApprove?.timeStamp)
                if (new Date((time + 100) * 1000) > new Date()) {
                  this.toster.warning('Please don\'t refresh, transaction is processing.');
                  let migratetokentokenAbi = {};
                  migratetokentokenAbi = appConfig.tokenV1V2;
                  let migratetokenContractAddress = appConfig.contractAddressV1V2Approve;
                  let userAddress = sessionStorage.getItem('account_ETH_trustWallet');
                  const data = {
                    amount: BigInt(this.userform.controls.from.value * Math.pow(10, 18)),
                  }

                  let migratetokeninstance = new this.web3.eth.Contract(
                    migratetokentokenAbi,
                    migratetokenContractAddress
                  );
                      const gasPrice = await this.web3.eth.getGasPrice();
                  this.web3.eth.sendTransaction({
                    from: userAddress,
                    to: migratetokenContractAddress,
                    //value: this.web3.utils.toHex(this.ethBridgeFee) ,
                    gasPrice: gasPrice,
                    data: migratetokeninstance.methods.migratetoken(EthcontractAddressV1, data.amount).encodeABI()

                        // from: userAddress,
                        // //to: bridgeBaseContractAddress,
                        // to: EthcontractAddress,
                        // gasPrice: gasPrice,
                        // //value: 0x0,
                        // value: parseFloat(this.userform.controls.from.value) * 1000000000000000000,
                        // data: instance.methods.swap(data.amount).encodeABI()

                      }).then((res: any) => {
                        // console.log("swap response  == ", res);
                        let transactionHash = res.transactionHash;
                        // console.log("your swap transaction hash is = ", transactionHash);
                        this.swapservice.ethSwap(transactionHash).subscribe((result:any)=>{
                          // console.log('final eth response = ',result);
                          this.check_get_Balance();
                          this.toster.success(result.message);
                          this.loading=false;
                          //For Clear both Input Type boxes
                          this.userform.patchValue({
                            from: 0
                          })
                          this.userform.patchValue({
                            to: 0
                          })
                        })
                      }).catch((err: any) => {
                        this.toster.error(err.message);
                        this.loading=false;
                      });
                      setTimeout(() => {
                        this.swapservice.getTransactionByAddress(this.walletConnectUserAddress).subscribe(async (success:any) => {
                          let transactionHashApprove = success["result"][0];
                        let time = parseInt(transactionHashApprove?.timeStamp)
                        //if (new Date((time + 100) * 1000) > new Date()) {
                        // console.log("swap response  == ", transactionHashApprove.hash);
                        let transactionHash = transactionHashApprove?.hash;
                        this.transactionHashAfterTrans = transactionHash;
                        let button:any = document.getElementById("trbutton");
                        button.click();
                        // console.log("your swap transaction hash is = ", transactionHash);
                        this.swapservice.ethSwap(transactionHash).subscribe((result:any)=>{
                          // console.log('final eth response = ',result);
                          this.check_get_Balance();
                          this.toster.success(result.message);
                          this.loading=false;
                          //For Clear both Input Type boxes
                          this.userform.patchValue({
                            from: 0
                          })
                          this.userform.patchValue({
                            to: 0
                          })
                        })
                      //}
                    },(error)=>{
                      this.toster.error("Something went wrong");
                  this.loading=false;
                    })

                      }, 60 * 1000);
                  
                  
                }else{
                  this.toster.error("Something went wrong");
                  this.loading=false;
                }
              }, (error) => {
                this.toster.error("Something went wrong");
                this.loading=false;
              });
            }
          }, 50 * 1000);
            
      } else{
        this.toster.error("Connect to "+this.isSelected+" Network")
      }
    } else{
      this.toster.info("Enter Value")
    }
  }
getweb3 = async() =>{
  const provider: any = new WalletConnectProvider({
    infuraId: appConfig.infuraId,
  });
  this.web3 = new Web3(provider);
}



  connectMetamask() {
    if(this.isDeviceMobile){
      this.metamask.disconnectAllWallet();
      // this.walletProvider();
      this.metamask.connectWalletHandler();
    }
    // else if (localStorage.getItem('walletconnect')){
    //   this.walletProvider();
    // }
    else{
      this.metamask.initMetaMask();
    }
  }

  getMaxValue(){
    if(window.ethereum?.networkVersion == "1"){

      if(sessionStorage.getItem('v1v2Balance')){
        let a:any = sessionStorage.getItem('v1v2Balance');
        let v1v2Bal = a / Math.pow(10,18);
        let walletBal= v1v2Bal.toString().split(".")[0];
        this.userform.patchValue({
          from: walletBal
        })      
      } else if(sessionStorage.getItem('ETH_trustWallet_balance')){
        let a:any = sessionStorage.getItem('ETH_trustWallet_balance');
        let v1v2Bal = a / Math.pow(10,18);
        let walletBal= v1v2Bal.toString().split(".")[0];
        this.userform.patchValue({
          from: walletBal
        }) 
      }
    }
  }

  async walletProvider() {
    // this.headerService.connectWalletFromDashboard.next(null);
  const provider: any = new WalletConnectProvider({
      infuraId: appConfig.infuraId,
      qrcodeModalOptions: {
        // mobileLinks: [
        //   "metamask",
        //   "trust",
        // ],
      },
    });
    await provider.enable();
  
    this.web3 = new Web3(provider);
    const accounts = await this.web3.eth.getAccounts();
    if (accounts[0]) {
      // this.metaMaskConnected = true;
      // this.accountAddress = accounts[0];
      sessionStorage.setItem('account', accounts[0]);
      sessionStorage.setItem('chainId', provider.chainId)
      sessionStorage.setItem('account_ETH_trustWallet', accounts[0]);
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
