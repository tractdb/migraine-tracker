import { Component } from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
import {DataDetailsServiceProvider} from "../../../providers/data-details-service/data-details-service";

/**
 * Generated class for the EditDataPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-edit-data',
  templateUrl: 'edit-data.html',
})
export class EditDataPage {

  private data;
  private dataField;
  private goalFreq;
  private goalThresh;
  private goalTime;
  private fieldList;
  private editField = false;
  private editGoal = false;
  private numList;

  constructor(public navParams: NavParams,
              public viewCtrl: ViewController,
              public dataDetails: DataDetailsServiceProvider) {
    this.data = navParams.data;
    this.numList = Array.from(new Array(30),(val,index)=>index+1);
  }

  ionViewDidLoad() {
    this.fieldList = this.dataDetails.getSupportedFields();
  }

  editData(type){
    if(type==='field'){
      if(this.editField){
        if(this.dataField && (this.data.field !== this.dataField)){
          this.data.fieldDescription = null;
          this.data.field = this.dataField;
        }
      }
      this.editField = !this.editField;
    }
    else if (type==='goal'){
      if(this.editGoal){
        this.data.goal = {
          'freq': (this.goalFreq ? this.goalFreq: this.data.goal.freq),
          "threshold": (this.goalThresh ? this.goalThresh: this.data.goal.threshold),
          'timespan': (this.goalTime ? this.goalTime: this.data.goal.timespan)
        };
      }
      this.editGoal = !this.editGoal;
    }
  }

  backToConfig(choice){
    if(choice==='add') {
      this.data.field = (this.dataField ? this.dataField: this.data.field);
      if(this.data.goal || this.goalFreq) {
        this.data.goal = {
          'freq': (this.goalFreq ? this.goalFreq: this.data.goal.freq),
          "threshold": (this.goalThresh ? this.goalThresh: this.data.goal.threshold),
          'timespan': (this.goalTime ? this.goalTime: this.data.goal.timespan)
        };
      }
      this.viewCtrl.dismiss(this.data);
    }
    else {
      this.viewCtrl.dismiss();
    }

  }

}
