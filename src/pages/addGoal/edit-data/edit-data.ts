import { Component } from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
import {DataDetailsServiceProvider} from "../../../providers/data-details-service/data-details-service";
import {GoalDetailsServiceProvider} from "../../../providers/goal-details-service/goal-details-service";

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
  private goalList = [];
  private editField : boolean = false;
  private fieldList : {[fieldProp: string] : any}[]= [];
  private editGoal : boolean = false;
  private numList : Number[];
  private allowsGoals: boolean;
  private somethingEdited : boolean = false;
  private fieldButtonsExpanded : boolean = false;
  private goalFreqExpanded : boolean = false;
  private goalThreshExpanded : boolean = false;
  private goalTimeExpanded : boolean = false;

  constructor(public navParams: NavParams,
              public viewCtrl: ViewController,
              public dataDetails: DataDetailsServiceProvider,
              public goalDetails: GoalDetailsServiceProvider) {
    this.allowsGoals = navParams.data['allowsDataGoals'];
    this.data = navParams.data['data'];
    if(!this.data.field) this.data.field = this.data.recommendedField;
    if(!this.data.goal){
      this.data.goal = {'freq': '', 'threshold': '', 'timespan': ''};
    }
    this.numList = Array.from(new Array(30),(val,index)=>index+1);
    this.getRecommendingGoals();
  }

  getRecommendingGoals(){
    for(let i=0; i<this.data.recommendingGoals.length; i++){
      if(this.navParams.data['selectedGoals'].indexOf(this.data.recommendingGoals[i]) > -1){
        this.goalList.push(this.goalDetails.getGoalNameByID(this.data.recommendingGoals[i]));
      }
    }
  }

  ionViewDidLoad() {
    this.fieldList = this.dataDetails.getSupportedFields();
  }

  editedField(field){
    this.data.field = field['name'];
    this.data.fieldExplanation = field['explanation'];
    this.somethingEdited = true;
    this.fieldButtonsExpanded = false;
  }

  editedGoal(goal){
    this.somethingEdited = true;
  }

  editData(type : string){
    if(type==='field'){
      this.editField = true;
      delete this.data.fieldDescription; // CHANGE IF WE DON'T LET THEM EDIT FIELDS
    }
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
