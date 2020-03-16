/// app.js
import React from 'react';
import DeckGL from '@deck.gl/react';
import {ScatterplotLayer} from '@deck.gl/layers';
import {StaticMap} from 'react-map-gl';

// Set your mapbox access token here
const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

// Initial viewport settings
const initialViewState = {
  longitude: 7.80899155236179, 
  latitude: 51.68114690118967,
  zoom: 15,
  pitch: 0,
  bearing: 0
};

export default class App extends React.Component {
  //initial state
  state = {
    allTracksData:[],
    data:[],
    cords:[],
    pointerX: 0,
    pointerY: 0,
    hoveredObject: null
  
  };

  //fetch data from api
  async componentDidMount(){

    const urlTracks="https://envirocar.org/api/stable/tracks";
    
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
      measure = await fetch(`https://envirocar.org/api/stable/tracks/${tracks[i].id}/measurements`);
      jsonMeasure = await measure.json();
      TrackMeasurements.push({
          "trackData":tracks[i],
          "measurement":jsonMeasure.features
        }
      );
      console.log(i+" fetched");
    }
    console.log(TrackMeasurements);
    this.setState({
      allTracksData:TrackMeasurements
    })
  }

  _renderTooltip() {
    const {hoveredObject, pointerX, pointerY} = this.state || {};
    //console.log(hoveredObject);   
    var boxData=""
    if(hoveredObject)
    {
      var arr=hoveredObject.properties.phenomenons 
      boxData= `Intake Temperature: ${(arr['Intake Temperature'] ? arr['Intake Temperature'].value+arr['Intake Temperature'].unit:``)},Speed: ${(arr['Speed'] ? arr['Speed'].value+arr['Speed'].unit:``)},GPS Bearing: ${(arr['GPS Bearing'] ? arr['GPS Bearing'].value+arr['GPS Bearing'].unit:``)},Rpm: ${(arr['Rpm'] ? arr['Rpm'].value+arr['Rpm'].unit:``)},Throttle Position: ${(arr['Throttle Position'] ? arr['Throttle Position'].value+arr['Throttle Position'].unit:``)},Consumption:${(arr['Consumption'] ? arr['Consumption'].value+arr['Consumption'].unit:``)},CO2: ${(arr['CO2'] ? arr['CO2'].value+arr['CO2'].unit:``)},Calculated MAF: ${(arr['Calculated MAF'] ? arr['Calculated MAF'].value+arr['Calculated MAF'].unit:``)},GPS Altitude:${(arr['GPS Altitude'] ? arr['GPS Altitude'].value+arr['GPS Altitude'].unit:``)},GPS Speed: ${(arr['GPS Speed'] ? arr['GPS Speed'].value+arr['GPS Speed'].unit:``)},Intake Pressure: ${(arr['Intake Pressure'] ? arr['Intake Pressure'].value+arr['Intake Pressure'].unit:``)},Engine Load: ${(arr['Engine Load'] ? arr['Engine Load'].value+arr['Engine Load'].unit:``)},GPS Accuracy: ${(arr['GPS Accuracy'] ? arr['GPS Accuracy'].value+arr['GPS Accuracy'].unit:``)}`
    }
    
    return hoveredObject && (
      <div style={{
        display: 'flex',
        position: 'fixed', 
        borderRadius:'10px',
        borderColor:'black',
        padding:'5px',
        zIndex: 1, 
        pointerEvents: 'none', 
        backgroundColor:'#616161',
        color:'white',
        left: pointerX, 
        top: pointerY
        }}>
        {JSON.stringify(boxData)}
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
            id:track.trackData.id,
            data:track.measurement,
            getPosition: d=>d.geometry.coordinates,
            getColor: d => [0, 128, 255],
            getRadius: d => 1500,
            opacity: 0.8,
            radiusMinPixels: 2,
            radiusMaxPixels: 5,
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
    return (
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
          />
          { this._renderTooltip() }
        </DeckGL>
      </div>
    );
  }
}