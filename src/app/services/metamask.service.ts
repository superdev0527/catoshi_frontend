import { Injectable } from '@angular/core';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import { ToastrService } from 'ngx-toastr';
import { appConfig } from '../config';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { BehaviorSubject, interval, Observable, Subject } from 'rxjs'
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
declare let window: any;
declare global {
      interface Window {
        connector:any;
        web3: any;
    }
}
@Injectable({
  providedIn: 'root'
})
export class MetamaskService {
  metaMaskStatus: string = 'Get MetaMask';
  web3: any;
  enable: any;
  private txnByDetails = new Subject<any>();
  txnByAddress: Observable<any>;
  constructor(private toster: ToastrService) {
    this.txnByAddress = this.txnByDetails.asObservable();

  }


  async onNetwirkChangeREload() {
    const ethereum: any = await detectEthereumProvider();

    ethereum
    if (ethereum) {
      ethereum.on('chainChanged', (chainId: any) => {
        window.location.reload();
      });
    }
  }


  checkMetaMaskInitial(): void {
    if (window.ethereum === undefined) {
      this.metaMaskStatus = 'Get MetaMask';
    } else {
      this.metaMaskStatus = 'Connect Wallet';
    }
  }



  metaMaskUpdate() {
    this.metaMaskStatus = 'Connect Wallet';
  }
  metaMaskUpdated() {
    this.metaMaskStatus = 'Wallet Connected';
  }
  //Connect to Metamask Wallet (FOR WEB)
  initMetaMask(): void {
    if (this.metaMaskStatus !== 'Wallet Connected') {
      if (window.ethereum === undefined) {
        this.toster.error('Non-Ethereum browser detected. Install MetaMask', '', { closeButton: true, progressBar: true });
        this.metaMaskStatus = 'Get MetaMask';
      } else {
        if (typeof window.web3 !== 'undefined') {
          this.web3 = new Web3(window.web3.currentProvider);
        } else {
          this.web3 = new Web3.providers.HttpProvider(appConfig.web3ProviderUrl);
        }

        window.web3 = new Web3(window.ethereum);
        this.enable = this.enableMetaMaskAccount();
        setInterval(function () {
          if (window.ethereum._state == "undefined" || window.ethereum._state?.accounts[0] === undefined) {
            // this.metaMaskStatus = 'Connect to a wallet';
            sessionStorage.removeItem('networkStatus')
          } else {
            if (sessionStorage.getItem('swapPage') == "swap") {
              if (window.ethereum?.networkVersion == sessionStorage.getItem('bscChainId') || window.ethereum?.networkVersion == sessionStorage.getItem('ethChainId')) {
                localStorage.setItem('networkStatus', "right")
              } else {
                localStorage.setItem('networkStatus', "wrong")
              }
            } else if (sessionStorage.getItem('swapPage') == "swapv1v2") {
              if (window.ethereum?.networkVersion == "1") {
                localStorage.setItem('networkStatus', "right")
              } else {
                localStorage.setItem('networkStatus', "wrong")
              }
            }

            // location.reload();
          }
        }, 1000);

        if (window.ethereum) {



          // Subscriptions register
          window.ethereum.on('accountsChanged', async (accounts: []) => {
            localStorage.removeItem('networkStatus');
            sessionStorage.removeItem('account_ropsten')
            this.txnByDetails.next(new Date())
            location.reload();
          });
          window.ethereum.on('networkChanged', async (network: number) => {
            if (sessionStorage.getItem('swapPage') == "swap") {
              if (window.ethereum?.networkVersion == sessionStorage.getItem('ethChainId') || window.ethereum?.networkVersion == sessionStorage.getItem('bscChainId')) {
                localStorage.setItem('networkStatus', "right")
              } else {
                localStorage.setItem('networkStatus', "wrong")
              }
            } else if (sessionStorage.getItem('swapPage') == "swapv1v2") {
              if (window.ethereum?.networkVersion == "1") {
                localStorage.setItem('networkStatus', "right")
              } else {
                localStorage.setItem('networkStatus', "wrong")
              }
            }
            location.reload();
          });



        }
      }
    }
    else {
      if (window.location.pathname == "/") {
        if (window.ethereum.networkVersion == sessionStorage.getItem('bscChainId')) {
          this.toster.success("BSC Mainnet Connected");
        } else if (window.ethereum.networkVersion == sessionStorage.getItem('ethChainId')) {
          this.toster.success("FANTOM MAINNET  Connected")
        } else {
          sessionStorage.clear()
          this.toster.info("Please connect to the appropriate FTM or BSC Network");
        }
      }
      else if (sessionStorage.getItem('swapPage') == "swapv1v2") {
        if (window.ethereum.networkVersion == "1") {
          this.toster.success(" Ethereum Mainnet Connected");
        } else {
          // sessionStorage.clear()
          this.toster.info("Please connect to the Ethereum Mainnet");
        }
      }

    }

  }





  enableMetaMaskAccount(): any {
    let enable = false;
    enable = window.ethereum.enable();
  }






  //Connect to Metamask Wallet (FOR MOBILE)
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

  async disconnectAllWallet(param = null, secParam = null) {
    let provider = new WalletConnectProvider({
      infuraId: 'c7bdbb105c584291960e2ff0ec4b8e0c',
      qrcodeModalOptions: {
        // mobileLinks: [
        //   "metamask",
        //   "trust",
        // ],
      }
    });
    sessionStorage.clear();
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletconnected');
    await provider.disconnect();
  }


   connectWalletHandler = () => {
    // Create a connector
    window.connector = new WalletConnect({
        bridge: "https://bridge.walletconnect.org", // Required
        qrcodeModal: QRCodeModal,
        qrcodeModalOptions: {
          mobileLinks: [
            "metamask",
            "trust",
          ],
        },
    });
    // setConnector(connector);
    // Check if connection is already established
    if (!window.connector.connected) {
        // create new session
        window.connector.createSession();
    }

    // Subscribe to connection events
    window.connector.on("connect", (error: any, payload:any) => {
        if (error) {
            throw error;
        }

        // Get provided accounts and chainId
        const { accounts, chainId } = payload.params[0];
        sessionStorage.setItem('account', accounts[0]);
        sessionStorage.setItem('chainId', chainId)
        sessionStorage.setItem('account_ETH_trustWallet', accounts[0]);
        // this.connectStatus = true;
        location.reload();
    });

    window.connector.on("session_update", (error:any, payload:any) => {
        if (error) {
            throw error;
        }

        // Get updated accounts and chainId
        const { accounts, chainId } = payload.params[0];
        console.log('session_update:',accounts)
    });

    window.connector.on("disconnect", (error:any, payload:any) => {
        if (error) {
            throw error;
        }

        // Delete connector
        console.log('onDesconnect:',payload)
        sessionStorage.removeItem('account');
        sessionStorage.removeItem('chainId');
        sessionStorage.removeItem('account_ETH_trustWallet');
        location.reload();
    });
}
}
