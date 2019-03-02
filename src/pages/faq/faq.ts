import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {GeneralInfoServiceProvider} from "../../providers/general-info-service/general-info-service";

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

  faqList;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public generalInfoService: GeneralInfoServiceProvider) {
  }

  ionViewDidLoad() {
    this.faqList = this.generalInfoService.getFaqData();
  }

  expndOrHide(question){
    console.log(question);
    if(question['expanded'] === undefined){
      question['expanded'] = true;
    }
    else{
      question['expanded'] = !question['expanded'];
    }
    console.log(question);
  }

}
