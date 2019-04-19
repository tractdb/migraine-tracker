import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DateFunctionServiceProvider} from "../../providers/date-function-service/date-function-service";

/**
 * Generated class for the DataElementTrackingComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'data-element-tracking',
  templateUrl: 'data-element-tracking.html'
})
export class DataElementTrackingComponent {

  private numericScaleVals : Number[];
  private buttonColors : {[dataName : string] : string} = {};


  @Input() data : {[dataProps: string]: any};
  @Input() trackedMedsToday : boolean = false;
  @Input() dataVal : any = null;
  @Input() dataStart: any = null;
  @Input() dataEnd : any = null;
  @Output() valueChanged : EventEmitter<{[dataVals: string] : any}> = new EventEmitter<{[dataVals: string] : any}>();


  itemTracked(event, type) {
    let dataVal;
    let dataStart;
    let dataEnd;
    if(type === 'val'){
      dataVal = event;
    }
    else if(type === 'start'){
      dataStart = event;
    }
    else{
      dataEnd = event;
    }
    this.valueChanged.emit({dataVal : dataVal, dataStart: dataStart, dataEnd: dataEnd})
  }

  catScale(value : string) {
    if(this.dataVal){
      this.buttonColors[this.dataVal] = 'light';
    }
    this.buttonColors[value] = 'primary';
    this.dataVal = value;
    this.itemTracked(value, 'val');
  }

  getColor(value : string) : string {
    if(this.buttonColors[value] === undefined){
      this.buttonColors[value] = 'light';
      return 'light';
    }
    return this.buttonColors[value];
  }

  ngOnInit() {
    if(this.dataVal){
      this.buttonColors[this.dataVal] = 'primary';
      if(this.data.field === 'time'){
        this.dataVal = this.dateFuns.getISOTime(this.dataVal);
      }
    }

    if(this.dataStart){
      this.dataStart = this.dateFuns.getISOTime(this.dataStart);
    }

    if(this.dataEnd){
      this.dataEnd = this.dateFuns.getISOTime(this.dataEnd);
    }

    // this.getColor(this.dataVal);
    // console.log(this.data);
  }

  constructor(private dateFuns: DateFunctionServiceProvider) {
    this.numericScaleVals = Array.from(new Array(10),(val,index)=>index+1);

  }

}
