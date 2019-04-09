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

  private data : {[dataInfo: string] : any} = {};
  private editField : boolean = false;
  private fieldList : {[fieldProp: string] : any}[]= [];
  private editGoal : boolean = false;
  private numList : Number[];
  private somethingEdited : boolean = false;

  constructor(public navParams: NavParams,
              public viewCtrl: ViewController,
              public dataDetails: DataDetailsServiceProvider) {
    this.data = navParams.data;
    console.log(this.data)
    this.numList = Array.from(new Array(30),(val,index)=>index+1);
  }

  ionViewDidLoad() {
    this.fieldList = this.dataDetails.getSupportedFields();
  }

  editedField(){
    this.somethingEdited = true;
  }

  editData(type){
    if(type==='field') this.editField = true;
    else if (type==='goal') this.editGoal = true;
  }

  backToConfig(choice : string){
    if(choice==='add') {
      this.viewCtrl.dismiss(this.data);
    }
    else if(choice=='remove'){
      this.viewCtrl.dismiss('remove');
    }
    else {
      this.viewCtrl.dismiss();
    }

  }

}
