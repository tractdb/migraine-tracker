import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DateFunctionServiceProvider} from "../../providers/date-function-service/date-function-service";


@Component({
  selector: 'data-element-tracking',
  templateUrl: 'data-element-tracking.html'
})
export class DataElementTrackingComponent {

  private buttonColors : {[dataName : string] : string} = {};


  @Input() data : {[dataProps: string]: any};
  @Input() trackedMedsToday : boolean = false;
  @Input() dataVal : any = null;
  @Input() dataStart: any = null;
  @Input() dataEnd : any = null;
  @Output() valueChanged : EventEmitter<{[dataVals: string] : any}> = new EventEmitter<{[dataVals: string] : any}>();


  constructor(private dateFuns: DateFunctionServiceProvider) {

  }

  ngOnInit() {
    if(this.dataVal){
      this.buttonColors[this.dataVal] = 'primary';
      if(this.data.field === 'time'){
        this.dataVal = this.dateFuns.getISOTime(this.dataVal);
        console.log(this.dataVal);
      }
    }

    if(this.dataStart){
      this.dataStart = this.dateFuns.getISOTime(this.dataStart);
    }

    if(this.dataEnd){
      this.dataEnd = this.dateFuns.getISOTime(this.dataEnd);
    }
  }


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
      this.buttonColors[this.dataVal] = 'midgrey';
    }
    this.buttonColors[value] = 'primary';
    this.dataVal = value;
    this.itemTracked(value, 'val');
  }

  getColor(value : string) : string {
    if(this.buttonColors[value] === undefined){
      this.buttonColors[value] = 'midgrey';
      return 'midgrey';
    }
    return this.buttonColors[value];
  }

}
