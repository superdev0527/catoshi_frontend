import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class UpdateTransactionService {
  private bsc = environment.apiurl + 'BSCEvents?blockNumber=';
  private eth = environment.apiurl + 'ETHEvents?blockNumber='
  constructor(private http:HttpClient) { }

  byBSC(data:any){
    return this.http.get(this.bsc+data);
  }

  
  byETH(data:any){
    return this.http.get(this.eth+data);
  }
}
