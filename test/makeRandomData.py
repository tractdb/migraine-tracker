import random
import datetime
import json 

categories = {
    "Symptoms": [
      {
        "name": "Migraine today",
        "fieldDescription": "Whether you had a migraine (yes/no)",
        "field": "binary",
      },
      {
        "name": "Headache today",
        "fieldDescription": "Whether you had a headache (yes/no)",
        "field": "binary",
      },
      {
        "name": "Peak migraine severity",
        "fieldDescription": "Pain level from 1-10",
        "field": "numeric scale",
        "recommendingGoal": [
          "Monitor for my doctor"
        ],
      },
      {
        "name": "Migraine duration",
        "field": "time range",
        "custom": True
      }
    ],
    "Treatments": [
      {
        "name": "As-needed medications today",
        "fieldDescription": "Whether you took any as-needed medication today",
        "field": "binary",
      },
      {
        "name": "Minutes exercised today",
        "fieldDescription": "Number of minutes of exercise",
        "field": "number",
      },
      {
        "name": "Time took advil",
        "field": "time",
        "custom": True
      }
    ],
    "Triggers": [
      {
        "name": "Sugar",
        "fieldDescription": "3-point stress rating",
        "field": "category scale",
      },
      {
        "name": "Menstruating",
        "fieldDescription": "binary",
        "field": "binary",
      },
      {
        "name": "Cups of Coffee",
        "fieldDescription": "number small",
        "field": "number",
      },
      {
        "name": "Screen time",
        "fieldDescription": "number large",
        "field": "number",
      },
      {
        "name": "Stress",
        "fieldDescription": "a rating from 1-10",
        "field": "numeric scale",
      },
      {
        "name": "Went to bed",
        "fieldDescription": "time",
        "field": "time",
      },
      {
        "name": "Sleep",
        "fieldDescription": "start and end times",
        "field": "time range",
      },
    ],
    "Other": [
      {
        "name": "abnormalities",
        "field": "note",
        "custom": True
      }
    ]
}


trackedData = []
numDataPoints = 31

def makeTime(hour, min):
    timeString = ''
    if hour < 10:
        timeString = '0'
    timeString += str(hour) + ":"
    if min < 10:
        timeString += '0'
    timeString += str(min)
    return timeString


def getRandomData(dataObject):
    field = dataObject['field']
    if field == "binary":
        rand = random.randrange(2)
        return rand == 0
    elif field == "number":
        if "small" in dataObject['fieldDescription']:
            return random.randrange(4)
        return random.randrange(20) # dunno 
    elif field == "numeric scale":
        return random.randrange(1,11)
    elif field == "category scale":
        rand = random.randrange(2)
        if rand == 0:
            return "None"
        if rand == 1:
            return "Some"
        return "Lots"
    elif field == "time":
        randHour = random.randrange(24)
        randMin = random.randrange(0, 60)
        return makeTime(randHour, randMin)
    elif field == "time range":
        randStartHour = random.randrange(24)
        randStartMin = random.randrange(0, 60)
        randEndHour = random.randrange(randStartHour, 24)
        randEndMin = random.randrange(randStartMin, 60) # eh
        return {'start': makeTime(randStartHour, randStartMin),
                'end': makeTime(randEndHour, randEndMin)}
    elif field == "note":
        return "note contents moot"
    else:
        print("field not supported!!!!" + field)
      

def getRandomDate():
    randMonth = random.randrange(1, 4)
    randDay = random.randrange(1,29)
    randHour = random.randrange(0,24)
    randMin = random.randrange(0, 60)
    dateTracked = datetime.datetime(2019, randMonth, randDay, \
                                    randHour, randMin)
    startDate = datetime.datetime(2019, randMonth, randDay, 0, 0)
    endDate = startDate + datetime.timedelta(days=1)
    return [dateTracked, startDate, endDate]


def isoFormat(date):
    return date.isoformat() + ".000Z"

def addDatapoint():
    dataPoint = {}
    for dataType, dataObjectList in categories.items():
        dataPoint[dataType] = {}
        for dataObject in dataObjectList:
            rand = random.randrange(5)
            if rand != 0: # to have some null data 
                dataPoint[dataType][dataObject['name']] =\
                                     getRandomData(dataObject)
    dateTracked, startDate, endDate = getRandomDate()
    dataPoint['dateTracked'] = isoFormat(dateTracked) # 2019-03-06T19:04:49.572Z"
    dataPoint['startTime'] = isoFormat(startDate) # "2019-03-07T00:00:00.000Z",
    dataPoint['endTime'] = isoFormat(endDate) # "2019-03-06T00:00:00.000Z",
    dataPoint['allDay'] = 'true'
    return dataPoint
    

def addDatapoints():
    for i in range(numDataPoints):
        trackedData.append(addDatapoint())
    print(json.dumps(trackedData, indent=4))



def main():
    addDatapoints()


if __name__ == '__main__':
    main()

