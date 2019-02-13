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

  private dataType;
  private dataName;
  private dataField;
  private goalFreq;
  private goalThresh;
  private goalTime;
  private fieldList;
  private numList;

  constructor(public navParams: NavParams,
              public viewCtrl: ViewController,
              public dataDetails: DataDetailsServiceProvider) {
    this.dataType = navParams.data.type;
    this.numList = Array.from(new Array(30),(val,index)=>index+1);
  }

  ionViewDidLoad() {
    this.fieldList = this.dataDetails.getSupportedFields();
  }

  backToConfig(choice){
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
