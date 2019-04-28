import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable} from "rxjs";

/*
  Generated class for the GeneralInfoServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class GeneralInfoServiceProvider {

  private faqObservable : Observable<any>;

  constructor(public http: HttpClient) {
  }


  getFaqData() : Observable<any> {
    if(!this.faqObservable){
      this.faqObservable = this.http.get('assets/migraineInfo.json', {},);
    }
    return this.faqObservable;
  }



}
