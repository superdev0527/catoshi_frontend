import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class TransactionService {
private getAllTrnx = environment.apiurl + 'getTrxDetails';
private speedUpTrnsaction = environment.apiurl + 'speedUpTrx?objectID=';

  constructor(private http:HttpClient) { }



  getAllTransaction(){
   return this.http.get(this.getAllTrnx);
  }

  speedUp(data:any){
    return this.http.get(this.speedUpTrnsaction + data);
  }
}
