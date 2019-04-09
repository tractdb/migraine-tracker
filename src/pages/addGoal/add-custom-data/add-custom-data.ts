import { Component } from '@angular/core';
import {NavParams, ViewController} from 'ionic-angular';
import {DataDetailsServiceProvider} from "../../../providers/data-details-service/data-details-service";

/**
 * Generated class for the AddCustomDataPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-add-custom-data',
  templateUrl: 'add-custom-data.html',
})
export class AddCustomDataPage {

  private dataType : string;
  private dataName : string;
  private dataField : string;
  private goalFreq : string;
  private goalThresh : Number;
  private goalTime : string;
  private fieldList : [{[fieldProp : string]:any}];
  private numList : Number[];

  constructor(public navParams: NavParams,
              public viewCtrl: ViewController,
              public dataDetails: DataDetailsServiceProvider) {
    this.dataType = navParams.data.type;
    this.numList = Array.from(new Array(30),(val,index)=>index+1);
  }

  ionViewDidLoad() {
    this.fieldList = this.dataDetails.getSupportedFields();
  }

  backToConfig(choice : string){
    if(choice==='add') {
      let data = {
        'name': this.dataName,
        'field': this.dataField,
        'goal': {
          'freq': this.goalFreq,
          "threshold": this.goalThresh,
          'timespan': this.goalTime
        }
      };
      this.viewCtrl.dismiss(data);
    }
    else {
      this.viewCtrl.dismiss();
    }

  }

}
