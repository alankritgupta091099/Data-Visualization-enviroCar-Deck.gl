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
    cords:[]
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
    console.log(jsonMeasure.features);
    this.setState({
      allTracksData:TrackMeasurements
    })
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
            opacity: 0.5,
            pickable: true,
            radiusMinPixels: 0.25,
            radiusMaxPixels: 30,
          })
        )
      })
      //console.log(layers)
      return layers
  }
  render() {
    return (
      <DeckGL
        initialViewState={initialViewState}
        controller={true}
        layers={this.renderLayers({cords:this.state.allTracksData})}
      >
        <StaticMap 
          mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
        />
      </DeckGL>
    );
  }
}