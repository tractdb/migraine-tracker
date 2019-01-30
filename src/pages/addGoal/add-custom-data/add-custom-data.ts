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

  constructor(public navParams: NavParams,
              public viewCtrl: ViewController,
              public dataDetails: DataDetailsServiceProvider) {
    this.dataType = navParams.data.type;
  }

  ionViewDidLoad() {
    this.fieldList = this.dataDetails.getSupportedFields();
  }

  backToConfig(choice){
    let data;
    if(choice==='cancel') {
      data = {
        'name': this.dataName,
        'field': this.dataField,
        'goal': {
          'freq': this.goalFreq,
          "threshold": this.goalThresh,
          'timespan': this.goalTime
        }
      };
    }
    else {
        data = {};
    }
    this.viewCtrl.dismiss(data);
    }

}
