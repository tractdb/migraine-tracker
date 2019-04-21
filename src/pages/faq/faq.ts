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

  private faqList : {[categoryInfo: string]: any}[] = [];

  constructor(public generalInfoService: GeneralInfoServiceProvider,
              public navCtrl: NavController,
              public navParams: NavParams
              ) {
  }

  ionViewDidLoad() {
    this.faqList = this.generalInfoService.getFaqData();
  }

  expandOrHide(question : {[questionProps: string]: any}){
    if(question['expanded'] === undefined){
      question['expanded'] = true;
    }
    else{
      question['expanded'] = !question['expanded'];
    }
  }

}
