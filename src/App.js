/// app.js
import React from 'react';
import DeckGL from '@deck.gl/react';
import {ScatterplotLayer} from '@deck.gl/layers';
import {StaticMap} from 'react-map-gl';

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

// Initial viewport settings
const initialViewState = {
  longitude: 7.588491060909099, 
  latitude: 51.96910699949048, 
  zoom: 7.5,
  pitch: 50,
  bearing: 5
};

export default class App extends React.Component {
  //initial state
  state = {
    allTracksData:[],
    data:[],
    cords:[],
    pointerX: 0,
    pointerY: 0,
    hoveredObject: null,
    loading:true,
    trackNo:0  
  };

  //fetch data from api
  async componentDidMount(){

    const urlTracks="https://envirocar.org/api/stable/tracks?bbox=7.0,51.1,7.3,52.0";
    
    var response = await fetch(urlTracks);
    var dataTracks = await response.json();

    this.getTracksMeasurement(dataTracks.tracks);
    
  }

  //extract ID's of all Tracks
   getTracksMeasurement = async (tracks) => {
    var TrackMeasurements=[];
    var measure=0;
    var jsonMeasure=0;
    var i=0;
    for(i;i<tracks.length;i++){
      measure = await fetch(`https://envirocar.org/api/stable/tracks/${tracks[i].id}`);
      jsonMeasure = await measure.json();
      TrackMeasurements.push(
        jsonMeasure
      );
      this.setState({
        trackNo:i
      })
      //console.log(i+" fetched");
    }
    console.log(TrackMeasurements);
    this.setState({
      allTracksData:TrackMeasurements,
      loading:false
    })
  }

  _renderTooltip() {
    const {hoveredObject, pointerX, pointerY} = this.state || {};
    console.log(hoveredObject);   
    var boxData=""
    if(hoveredObject)
    {
      var arr=hoveredObject.properties.phenomenons 
      boxData= `<div>
      ${(arr['Intake Temperature'] ? "<b>Intake Temperature: </b> <i>"+arr['Intake Temperature'].value+ arr['Intake Temperature'].unit+"</i><br>":``)}
      ${(arr['Speed'] ?"<b>Speed: </b><i>"+arr['Speed'].value+arr['Speed'].unit+"</i><br>":``)} 
      ${(arr['GPS Bearing'] ?"<b>GPS Bearing: </b><i>"+arr['GPS Bearing'].value+arr['GPS Bearing'].unit+"</i> ,<br>":``)}
      ${(arr['Rpm'] ?"<b>Rpm: </b><i>"+arr['Rpm'].value+arr['Rpm'].unit+"</i><br>":``)}
      ${(arr['Throttle Position'] ?"<b>Throttle Position: </b><i>"+arr['Throttle Position'].value+arr['Throttle Position'].unit+"</i><br>":``)}
      ${(arr['Consumption'] ?"<b>Consumption: </b><i>"+arr['Consumption'].value+arr['Consumption'].unit+"</i><br>":``)}
      ${(arr['CO2'] ?"<b>CO2: </b><i>"+arr['CO2'].value+arr['CO2'].unit+"</i><br>":``)}
      ${(arr['Calculated MAF'] ?"<b>Calculated MAF: </b><i>"+arr['Calculated MAF'].value+arr['Calculated MAF'].unit+"</i><br>":``)}
      ${(arr['GPS Altitude'] ?"<b>GPS Altitude: </b><i>"+arr['GPS Altitude'].value+arr['GPS Altitude'].unit+"</i><br>":``)}
      ${(arr['GPS Speed'] ?"<b>GPS Speed: </b><i>"+arr['GPS Speed'].value+arr['GPS Speed'].unit+" </i><br>":``)}
      ${(arr['Intake Pressure'] ?"<b>Intake Pressure: </b><i>"+arr['Intake Pressure'].value+arr['Intake Pressure'].unit+"</i><br>":``)}
      ${(arr['Engine Load'] ?"<b>Engine Load: </b><i>"+arr['Engine Load'].value+arr['Engine Load'].unit+"</i><br>":``)}
      ${(arr['GPS Accuracy'] ?"<b>GPS Accuracy: </b><i>"+arr['GPS Accuracy'].value+arr['GPS Accuracy'].unit+"</i>":``)}
      </div>`
    }
    
    return hoveredObject && (
      <div 
      style={{
        display: 'flex',
        position: 'fixed', 
        borderRadius:'3px',
        padding:'5px',
        zIndex: 1, 
        fontFamily:'Ubuntu',
        textTransform:'uppercase',
        width:'360px',
        height:'auto',
        pointerEvents: 'none', 
        backgroundColor:'#F9F947',
        color:'#424242',
        left: pointerX, 
        top: pointerY
        }}      
      dangerouslySetInnerHTML={{
        __html:boxData
        }}>

      </div>
    );
  }

  //rendering layers
  renderLayers = (props) => {
      const layers=[];
      const {cords} = props;
      //console.log(cords)
      cords.forEach(track=>{
        layers.push(
          new ScatterplotLayer({
            id: track.properties.id,
            data: track.features,
            getPosition: d=>d.geometry.coordinates,
            getColor: d => {
              if(track.properties.sensor.properties.engineDisplacement<1600)
              {
                return [250,162,0]
              }
              else if(track.properties.sensor.properties.engineDisplacement<1800){
                return [126,212,2]
              }
              else{
                return [249,249,71]
              }
            },            
            getRadius: d => 20,
            opacity: 1,
            radiusMinPixels: 1,
            radiusMaxPixels: 4,
            pickable: true,
            onHover: info => this.setState({
              hoveredObject: info.object,
              pointerX: info.x,
              pointerY: info.y
            })
          })
        )
      })
      //console.log(layers)
      return layers
  }
  render() {
    if(this.state.loading)
      return(
          <div style={{margin:'200px 300px 0 300px', textAlign:'center'}}>
            <h1><i>Fetching all tracks..</i></h1>
            <p><i>{this.state.trackNo+2} </i>track(s) Fetched</p>
            <p>Data visualisation is done on following basis -</p>
             <p> All the tracks are being fetched initially. After this all track data is being fetched for each track. On hovering over the layers, attributes can be be seen in the flex box and tracks are being coloured on the basis of engineDisplacement</p>
          </div>
      ) 
    else return (
      <div>
        <DeckGL
          initialViewState={initialViewState}
          controller={true}
          layers={this.renderLayers({
            cords:this.state.allTracksData
          })}
        >
          <StaticMap 
            mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
            mapStyle={'mapbox://styles/mapbox/dark-v10'}
          />
          { this._renderTooltip() }
        </DeckGL>
      </div>
    );
  }
}