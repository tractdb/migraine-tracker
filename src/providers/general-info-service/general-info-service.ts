import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the GeneralInfoServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class GeneralInfoServiceProvider {

  private faqData : any;

  constructor(public http: HttpClient) {
    this.http.get('assets/migraineInfo.json', {},).subscribe(faqData => {
        this.faqData = faqData;
      },
      error => {
        console.log(error);
      });
  }

  getFaqData() : {[section: string] : any}[] {
    return this.faqData;
  }



}
