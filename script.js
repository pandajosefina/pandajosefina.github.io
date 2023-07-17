var width = 1200,
    height = 600;

// read json and csv file
const promises = [d3.json("https://gist.githubusercontent.com/alexwebgr/10249781/raw/2df84591a9e1fb891bcfde3a3c41d6cfc70cb5ee/world-topo.json"),
d3.csv("https://raw.githubusercontent.com/pandajosefina/pandajosefina.github.io/main/covid_cases_full_grouped.csv")];

var projection = d3.geoMercator()
    .translate([width / 2, height / 2])
    .scale(140)

var path = d3.geoPath()
    .projection(projection);

const colorScale = d3.scaleThreshold()
    .domain([1000, 10000, 100000, 1000000, 1000000])
    .range(d3.schemePurples[5])
    .unknown("#E6E6E6");

const legend = g => {

    const y = d3.scaleBand([1000, 10000, 100000, 1000000, 1000000], [0, 90]);

    g.selectAll("rect")
        .data(colorScale.range().map(d => colorScale.invertExtent(d)))
        .join("rect")
        .attr("height", 25)
        .attr("y", d => y(d[0]))
        .attr("width", "20px")
        .attr("fill", d => colorScale(d[0]));

    g.append("text")
        .attr("class", "caption")
        .attr("y", y.range()[0] - 10)
        .attr("x", 0)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-size", "12px")
        .text("# of new cases");

    const labels = ["1,000", "10,000", "100,000", "1,000,000"]

    g.call(d3.axisLeft(y)
        .tickValues([1000, 10000, 100000, 1000000, 1000000])
        .tickFormat(function (d, i) {
            return labels[i];
        }))
        .select(".domain")
        .remove()
}


const annotation_china = [
    {
        note: {
            label: "WHO Announces mysterious coronavirus-related pneumonia in Wuhan, China",
            title: "2020 January",
            wrap: 150,
            padding: 10
        },
        connector: {
            end: "dot",        // Can be none, or arrow or dot
            endScale: 5,
        },
        color: ["#000000"],
        x: projection([104.1954, 35.8617])[0],
        y: projection([104.1954, 35.8617])[1],
        dy: -30,
        dx: 10
    }
]


const annotation_world = [
    {
        note: {
            label: "Covid new cases increased in the US, Europe and all around the world. WHO Declares COVID-19 a Pandemic",
            title: "2020 March",
            wrap: 150,
            padding: 10

        },
        color: ["#000000"],
        x: projection([-77.03333333333333, 38.88333333333333])[0],
        y: projection([-77.03333333333333, 38.88333333333333])[1],
        dy: -20,
        dx: 30
    }
]

const annotation_final = [
    {
        note: {
            label: "New Covid cases continued to increase. Global confirmed COVID-19 cases surpass 80M.",
            title: "2020 December",
            wrap: 150,
            padding: 10

        },
        color: ["#000000"],
        x: projection([-77.03333333333333, 38.88333333333333])[0],
        y: projection([-77.03333333333333, 38.88333333333333])[1],
        dy: -20,
        dx: 30
    }
]

function annotate(annotation_text) {
    d3.select("svg").append("g")
        .attr("id", "annotations")
        .style("font-size", "10px")
        .call(d3.annotation()
            .annotations(annotation_text))
        .style("opacity", 1)

}

// fill map function 
function fillMap(year, json_data, csv_data) {

    var svg = d3.select("#map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    svg.append("g")
        .attr("transform", "translate(100,20)")
        .call(legend);

    var countries = topojson.feature(json_data, json_data.objects.countries).features;
    var current_data = csv_data.filter(function (d) { return d.year_month == year })

    // color fill 
    const fill_data = {};
    current_data.forEach(function (d) {
        fill_data[d.Country_code] = +d.New_cases
    });

    // countries base
    svg.selectAll(".country")
        .data(countries)
        .enter().append("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("fill", function (d) {
            return colorScale(fill_data[d.properties.countryCode])
        })
        .on('mouseover', function (d, i) {
            d3.select(this).transition()
                .duration('100')
                .attr('opacity', .3)
            // tooltip
            d3.select("#country").html("<strong>Country: </strong>" + d.properties.name);
            d3.select("#new_cases").html("<strong># of new cases: </strong>"
                + fill_data[d.properties.countryCode].toLocaleString('en-US'));

            d3.select("#tooltip")
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 15) + "px")
                .style("display", "block")
                .style("opacity", 0.9);
        })
        .on('mouseout', function (d, i) {
            d3.select(this).transition()
                .duration('100')
                .attr('opacity', 1)
            d3.select("#tooltip").style("display", "none");
        })

}

Promise.all(promises).then(ready)

function ready([json_data, csv_data]) {

    fillMap("2020-01", json_data, csv_data)
    annotate(annotation_china);


    // 2020 feb
    d3.select("#first")
        .on('click', function () {
            d3.select("#map").html("");
            d3.select("#first").attr("class", "button is-link")
            d3.select("#second").attr("class", "button is-link is-light")
            d3.select("#third").attr("class", "button is-link is-light")
            fillMap("2020-01", json_data, csv_data)
            annotate(annotation_china);

        })

    // 2020 mar
    d3.select("#second")
        .on('click', function () {
            d3.select("#map").html("");
            d3.select("#annotations").html("");
            d3.select("#first").attr("class", "button is-link is-light")
            d3.select("#second").attr("class", "button is-link")
            d3.select("#third").attr("class", "button is-link is-light")
            fillMap("2020-03", json_data, csv_data)
            annotate(annotation_world);
        })

    // 2021 mar
    d3.select("#third")
        .on('click', function () {
            d3.select("#map").html("");
            d3.select("#annotations").html("");
            d3.select("#first").attr("class", "button is-link is-light")
            d3.select("#second").attr("class", "button is-link is-light")
            d3.select("#third").attr("class", "button is-link ")
            fillMap("2020-12", json_data, csv_data)
            annotate(annotation_final);
        })

}











