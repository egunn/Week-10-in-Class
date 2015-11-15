var margin = {t:50,l:50,b:50,r:50},
    width = document.getElementById('map').clientWidth-margin.l-margin.r,
    height = document.getElementById('map').clientHeight-margin.t-margin.b;

var svg = d3.select('.canvas')
    .append('svg')
    .attr('width',width+margin.l+margin.r)
    .attr('height',height+margin.t+margin.b)
    .append('g').attr('class','map')
    .attr('transform',"translate("+margin.l+","+margin.t+")");


//First, set up a projection
var projection = d3.geo.albersUsa()
	.translate([width/2, height/2]);
    //.scale(300); //customize your projection by adding a scale function (how much to blow up the map) default = 120 (?)
    //300 makes smaller, 3000 makes bigger

//Then, define a 
var pathGenerator = d3.geo.path()
	.projection(projection);

//creating a map structure - populate in the parse function
var rateById = d3.map();

//create a formatting function
var formatNumber = d3.format('05');

//Color scale
var colorScale = d3.scale.linear().domain([0,.2]).range(['white','red']); //range 0-1 is too broad; redefine for max 20% unemployment

//import geojson data
queue()
	.defer(d3.json, "data/gz_2010_us_050_00_5m.json")
	.defer(d3.json, "data/gz_2010_us_040_00_5m.json")
    .defer(d3.tsv, "data/unemployment.tsv", parseData)
	.await(function(err, counties, states){
    console.log(rateById);

    draw(counties, states);

    });

function draw(counties, states){

    svg.selectAll('.county')
        .data(counties.features)
        .enter()
        .append('path')
        .attr('class','country')
        .attr('d', pathGenerator)
        .style('fill', function(d){
            //d is an individual feature in the GeoJSON file

            var countyId = +(d.properties.STATE + d.properties.COUNTY); //combine state and county # to form unique ID
            //5 digits from GeoJSON, 4 digits from lookup table - if state id is 01, county id is 001, combination is 01001
            //for lookup, want to get rid of leading zero. Convert to a number to eliminate leading zeros.
            var rate = rateById.get(countyId); //0 to 1 (percentage) //lookup ID in table from d3.map
                if (rate == undefined){
                    return "blue"
                }
            return colorScale(rate); //return the color value

            console.log(countyId);
        });

    svg.append('path')
        .datum(states)
        .attr('class', 'state')
        .attr('d', pathGenerator);
}

function parseData(d){  //can only pass one dataset at a time to the parseData function.
    // If you want to merge, put it in a callback, after both have been loaded.
    //add id and unemployment to lookup as we parse ea row
    rateById.set(d.id, +d.rate); //create new

    //not even returning anything - just populating lookup table.
}