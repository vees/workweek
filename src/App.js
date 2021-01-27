import React from 'react';
// import moment from 'moment';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
// Radial separators
import RadialSeparators from "./RadialSeparators";

class MyTimer extends React.Component {
  constructor(props){
    super(props)
    this.state={sheettime:0, clocktime:0, active:false}
  }

  nextDate(dayIndex) {
    var today = new Date();
    today.setDate(today.getDate() + (dayIndex - 1 - today.getDay() + 7) % 7 + 1);
    return today;
}

  refreshToggl() {
    var weekending = this.nextDate(0).toLocaleDateString('en-CA')
    fetch("https://vees.net/apps/toggl/"+weekending+"/", {mode: 'cors', cache: 'no-store'})
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result.active)
          if (result.active===true) {
            var sheettime = Math.max(result.sheettime*60,this.state.sheettime)
            var clocktime = Math.max(result.clocktime*60,this.state.clocktime)
            this.setState({
              sheettime: sheettime,
              clocktime: clocktime,
              active: result.active })
          } else {
            this.setState({
              sheettime: result.sheettime*60,
              clocktime: result.clocktime*60,
              active: result.active})
          }
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          console.log(error)
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  tickWhenActive()
  {
    console.log("tick")
     if (this.state.active && this.state.active === true) {
        this.setState(
         {sheettime: this.state.sheettime+1,
          clocktime: this.state.clocktime+1})
      }
  }

  componentDidMount() {
    console.log("in cdm")
    this.refreshToggl()
    this.togglTimer = setInterval(() => this.refreshToggl(), 30000)
    this.countdownTimer = setInterval(() => this.tickWhenActive(), 1000)
  }

  render(){
    return (
      <div>
      <CircularProgressbarWithChildren 
        value={this.state.sheettime} 
        maxValue={144000} text=""
        styles={buildStyles({
          pathColor: "green",
          trailColor: "darkred",
          strokeLinecap: "butt"
        })}
      >
              <RadialSeparators
          count={5}
          style={{
            background: "#000",
            width: "3px",
            // This needs to be equal to props.strokeWidth
            height: `${9}%`
          }}
        />
            <h1>Sheet Time <CurrentTime sheettime={this.state.sheettime} /></h1>
      </CircularProgressbarWithChildren>
      <h1>Clock Time <CurrentTime sheettime={this.state.clocktime} /></h1>
      </div>
      )
  }
}

// class ActivityBox extends React.Component {
//   render(){
//     if (this.props.active === true) {
//       return (<span>Active</span>)
//     }
//     return (<span>Inactive</span>)
//   }
// }

class CurrentTime extends React.Component {

  toTimeString(totalSeconds)
  {
    var hours = Math.floor(totalSeconds / 3600)
    totalSeconds %= 3600
    var minutes = Math.floor(totalSeconds / 60)
    var seconds = totalSeconds % 60;
    var time = hours.toString().padStart(2,'0') + ":" + 
      minutes.toString().padStart(2,'0') + ":" + seconds.toString().padStart(2,'0')
    return time
  }

  render(){

    var remain = this.toTimeString(144000-this.props.sheettime)
    var logged = this.toTimeString(this.props.sheettime)
    return (
      <div><span className="green">{logged}</span> <span className="red">{remain}</span></div>
    );
  }
}



export default function App() {
  return (
    <div className="container">
      <MyTimer />
    </div>
  );
}
