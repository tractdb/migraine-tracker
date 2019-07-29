import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {GeneralInfoServiceProvider} from "../../providers/general-info-service/general-info-service";
import {GlobalFunctionsServiceProvider} from "../../providers/global-functions-service/global-functions-service";

/**
 * Generated class for the FaqPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-faq',
  templateUrl: 'faq.html',
})
export class FaqPage {

  private faqList : {[categoryInfo: string]: any}[] = [];
  private contactEmail: string = "";

  constructor(public generalInfoService: GeneralInfoServiceProvider,
              public navCtrl: NavController,
              public navParams: NavParams, private globalFuns: GlobalFunctionsServiceProvider) {
  }

  ionViewDidLoad() {
    this.contactEmail = this.globalFuns.getContactEmail();
    let actualThis = this;
    this.generalInfoService.getFaqData().subscribe(faqData => {
        actualThis.faqList = faqData;
      },
      error => {
        console.log(error);
      });
  }

  expandOrHide(question : {[questionProps: string]: any}){
    if(!question['expanded']) question['expanded'] = true;
    else question['expanded'] = !question['expanded'];
  }

}
