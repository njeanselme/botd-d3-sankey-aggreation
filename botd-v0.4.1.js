// https://observablehq.com/@d3/sankey-diagram@280
// Nicolas Jeanselme 2021
// Dynamic Integration with csp.infoblox.com


export default function define(runtime, observer) {
  const main = runtime.module();
  
  main.variable(observer()).define(["md"], function(md){return(
md`# BloxOne Threat Defense`
)});


 main.variable(observer("viewof token")).define("viewof token", ["html","URLSearchParams"], function(html,URLSearchParams){return(
Object.assign(html`<input type=text>
`, {
  value: new URLSearchParams(html`<a href>`.search).get("token") || "type your token here"
})
)});
  main.define("token", ["Generators", "viewof token"], (G, _) => G.input(_));


  main.variable(observer("viewof edgeColor")).define("viewof edgeColor", ["html","URLSearchParams"], function(html,URLSearchParams){return(
Object.assign(html`<select>
  <option value=input>Color by input
  <option value=output>Color by output
  <option value=path selected>Color by input-output
  <option value=none>No color
</select>`, {
  value: new URLSearchParams(html`<a href>`.search).get("color") || "path"
})
)});
  main.define("edgeColor", ["Generators", "viewof edgeColor"], (G, _) => G.input(_));
  
  
  main.variable(observer("viewof align")).define("viewof align", ["html","URLSearchParams"], function(html,URLSearchParams){return(
Object.assign(html`<select>
  <option value=left>Left-aligned
  <option value=right>Right-aligned
  <option value=center selected>Centered
  <option value=justify>Justified
</select>`, {
  value: new URLSearchParams(html`<a href>`.search).get("align") || "center"
})
)});
  main.define("align", ["Generators", "viewof align"], (G, _) => G.input(_));


 main.variable(observer("viewof since")).define("viewof since", ["html","URLSearchParams"], function(html,URLSearchParams){return(
Object.assign(html`<select>
  <option value=1 selected>last 1h
  <option value=24>last 1d
  <option value=168>last 7d
  <option value=720>last 30d
</select>`, {
  value: new URLSearchParams(html`<a href>`.search).get("since") || "1"
})
)});
  main.define("since", ["Generators", "viewof since"], (G, _) => G.input(_));

 main.variable(observer("viewof filter")).define("viewof filter", ["html","URLSearchParams"], function(html,URLSearchParams){return(
Object.assign(html`<textarea rows="6" cols="100">
type in ['2'] and tclass == 'Mal*' or tclass == 'APT' or tclass =='Phishing' or tclass =='Data Exfiltration' or tclass =='CompromisedHost' or tclass == 'Spambot' or tclass == 'Bot' or tclass == 'DGA' or tclass == 'Fast Flux'
</textarea>
`, {
  value: new URLSearchParams(html`<a href>`.search).get("filter") || "type in ['2'] and tclass == 'Mal*' or tclass == 'APT' or tclass =='Phishing' or tclass =='Data Exfiltration' or tclass =='CompromisedHost' or tclass == 'Spambot' or tclass == 'Bot' or tclass == 'DGA' or tclass == 'Fast Flux'"
})
)});
  main.define("filter", ["Generators", "viewof filter"], (G, _) => G.input(_));


 main.variable(observer("viewof toplimit")).define("viewof toplimit", ["html","URLSearchParams"], function(html,URLSearchParams){return(
Object.assign(html`<select>
  <option value=5>limit to top 5
  <option value=10 selected>limit to top 10
  <option value=15>limit to top 15
  <option value=20>limit to top 20
</select>`, {
  value: new URLSearchParams(html`<a href>`.search).get("toplimit") || "10"
})
)});
  main.define("toplimit", ["Generators", "viewof toplimit"], (G, _) => G.input(_));


main.variable(observer("viewof groupby1")).define("viewof groupby1", ["html","URLSearchParams"], function(html,URLSearchParams){return(
Object.assign(html`<select>
  <option value=tclass selected>Group by Threat Class First
  <option value=tproperty>Group by Threat Property First
  <option value=device_name>Group by Device Name First
  <option value=threat_indicator>Group by Threat Indicator First
</select>`, {
  value: new URLSearchParams(html`<a href>`.search).get("groupby1") || "tclass"
})
)});
  main.define("groupby1", ["Generators", "viewof groupby1"], (G, _) => G.input(_));

main.variable(observer("viewof groupby2")).define("viewof groupby2", ["html","URLSearchParams"], function(html,URLSearchParams){return(
Object.assign(html`<select>
  <option value=tclass>Group by Threat Class Then
  <option value=tproperty>Group by Threat Property Then
  <option value=device_name selected>Group by Device Name Then
  <option value=threat_indicator>Group by Threat Indicator Then
</select>`, {
  value: new URLSearchParams(html`<a href>`.search).get("groupby2") || "device_name"
})
)});
  main.define("groupby2", ["Generators", "viewof groupby2"], (G, _) => G.input(_));
 
  main.variable(observer("chart")).define("chart", ["d3","data","color","format","edgeColor","since","filter","toplimit","groupby1","groupby2","align","token","DOM"], async function(d3,data,color,format,edgeColor,since,filter,toplimit,groupby1,groupby2,align,token,DOM)
{

  const width = 954
  const height = 600

  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])

  const sankey = d3.sankey()
      .nodeId(d => d.name)
      .nodeAlign(d3[`sankey${align[0].toUpperCase()}${align.slice(1)}`])
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[1, 5], [width - 1, height - 5]])
      .linkSort(null)


  var {nodes, links} = sankey(data)

  async function appendData(clickedValue, pivotField, fieldToAdd){
  	
    var originalData = data      		
    var now_date = new Date()
    var t1 = Math.round(now_date.getTime() / 1000) - 100
    var t0 = t1 - (60 * 60 * since)
       		
    console.log({t0:t0, t1:t1, since:since, toplimit:toplimit, groupby1:groupby1, groupby2:groupby2})
    console.log({clickedValue:clickedValue, pivotField:pivotField, fieldToAdd:fieldToAdd})

  	
  	return await d3.json("https://csp.infoblox.com/api/ti-reports/v1/activity/aggregations", {
            method: 'POST',
            headers: [
    				["Content-Type", "application/json"],
				    ["Authorization", "Token "+token]
  				  ],
            body : JSON.stringify({
    "include_count": false,
    "t0": t0,
    "t1": t1,
    "_filter": "(" + filter + ") and " + pivotField + " == '" + clickedValue + "'",
    "aggs": [
        {
            "key": pivotField,
            "sub_key": [
                {
                    "key": fieldToAdd
                }
            ]
        }
    ],
    "size": 30
    })
    }).then(function(data) {

	    if (data) {

	        var out = []
	        
	        //put original data
	        
	        for (var i = 0; i < originalData.links.length; i++) {
	        	var entry = {}
	        	entry['source'] = originalData.links[i].source.name
	        	entry['target'] = originalData.links[i].target.name
	        	entry['value']  = originalData.links[i].value
	        	out.push(entry)
	        }
	        
	        // add new data
	        
			data = data.results 

			for (var i = 0; i < data.length; i++) {
				for (var j = 0 ; j <  data[i]['sub_bucket'][0]['sub_bucket'].length ; j++) {
					var entry = {}
					entry['source'] = data[i]['key']
					entry['target'] = data[i]['sub_bucket'][0]['sub_bucket'][j]['key']
					entry['value']  = parseInt(data[i]['sub_bucket'][0]['sub_bucket'][j]['count'],10)
					out.push(entry)
				}
			}
						
			var links = out
			var nodes = Array.from(new Set(links.flatMap(l => [l.source, l.target])), name => ({name, category: name}));
			
			data = {nodes, links, units: ""}
			console.log(data)
			
			const sankey = d3.sankey()
		      .nodeId(d => d.name)
		      .nodeAlign(d3[`sankey${align[0].toUpperCase()}${align.slice(1)}`])
		      .nodeWidth(15)
		      .nodePadding(10)
		      .extent([[1, 5], [width - 1, height - 5]])
		      .linkSort(null)

			sankey(data)
			links = data.links
			nodes = data.nodes
			
			updateSankey(links,nodes)
			
			
	    }
	    
    	}
  	  ).catch(function(error) {
 	   		console.warn(error)
		})

	}

function updateSankey(links,nodes){
			sankey
		      .nodes(nodes)
		      .links(links)
  	
  			svg.selectAll("rect").remove()
  			svg.selectAll("g").remove()
  			
  			//nodes
			svg.append("g")
    		.attr("stroke", "#000")
  			.selectAll("rect")
    		.data(nodes)
    		.join("rect")
		      .attr("x", d => d.x0)
		      .attr("y", d => d.y0)
		      .attr("height", d => d.y1 - d.y0)
		      .attr("width", d => d.x1 - d.x0)
		      .attr("fill", color)
	        .on("click", function(d){
      			appendData(`${d.path[0].__data__.name}`, "device_name", "threat_indicator")
	      	})
    	    .append("title")
     	 	.text(d => `${d.name}\n${format(d.value)}`)
     	 	
     	 	//links
     	 	 const link = svg.append("g")
      		.attr("fill", "none")
	  	    .attr("stroke-opacity", 0.5)
     	 	.selectAll("g")
		    .data(links)
		    .join("g")
		    .style("mix-blend-mode", "multiply")

    
 			 if (edgeColor === "path") {
			    const gradient = link.append("linearGradient")
			        .attr("id", d => (d.uid = DOM.uid("link")).id)
			        .attr("gradientUnits", "userSpaceOnUse")
			        .attr("x1", d => d.source.x1)
			        .attr("x2", d => d.target.x0);

			    gradient.append("stop")
			        .attr("offset", "0%")
			        .attr("stop-color", d => color(d.source));

			    gradient.append("stop")
			        .attr("offset", "100%")
			        .attr("stop-color", d => color(d.target));
			  }

			  link.append("path")
			      .attr("d", d3.sankeyLinkHorizontal())
			      .attr("stroke", d => edgeColor === "none" ? "#aaa"
		          : edgeColor === "path" ? d.uid 
		          : edgeColor === "input" ? color(d.source) 
		          : color(d.target))
		      .attr("stroke-width", d => Math.max(1, d.width))

			  link.append("title")
			      .text(d => `${d.source.name} → ${d.target.name}\n${format(d.value)}`);

			  svg.append("g")
			      .attr("font-family", "sans-serif")
			      .attr("font-size", 10)
			    .selectAll("text")
			    .data(nodes)
			    .join("text")
			      .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
			      .attr("y", d => (d.y1 + d.y0) / 2)
			      .attr("dy", "0.35em")
			      .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
			      .text(d => d.name)
		      .on("click", function(d){
      			appendData(`${d.path[0].__data__.name}`, "device_name", "threat_indicator")
		      	})
			
}

 
  updateSankey(links,nodes)
  return svg.node();
}
)


  main.define("format", ["d3","data"], function(d3,data)
{
  const format = d3.format(".2s");
  return data.units ? d => `${format(d)} ${data.units}` : format;
}
)


  main.define("color", ["d3"], function(d3)
{
  const color = d3.scaleOrdinal(d3.schemeCategory10);
  return d => color(d.category === undefined ? d.name : d.category);
}
)


  main.define("data", ["d3","since","filter","toplimit","groupby1","groupby2","token"], async function(d3,since,filter,toplimit,groupby1,groupby2,token)
{

  toplimit = parseInt(toplimit,10)
  since = parseInt(since,10)
  
  var now_date = new Date();
  var t1 = Math.round(now_date.getTime() / 1000) - 100;
  var t0 = t1 - (60 * 60 * since)

  console.log({t0:t0, t1:t1, since:since, toplimit:toplimit, groupby1:groupby1, groupby2:groupby2})
  
  
  return await d3.json("https://csp.infoblox.com/api/ti-reports/v1/activity/aggregations", {
            method: 'POST',
            headers: [
    				["Content-Type", "application/json"],
				    ["Authorization", "Token "+token]
    ],
            body : JSON.stringify({
    "include_count": false,
    "t0": t0,
    "t1": t1,
    "_filter": filter,
    "aggs": [
        {
            "key": groupby1,
            "sub_key": [
                {
                    "key": groupby2
                }
            ]
        }
    ],
    "size": toplimit
    })
    }).then(function(data) {

	    if (data) {
	        var out = []
			data=data.results

			for (var i = 0; i < data.length; i++) {
				for (var j = 0 ; j <  data[i]['sub_bucket'][0]['sub_bucket'].length ; j++) {
					var entry = {}
					entry['source'] = data[i]['key']
					entry['target'] = data[i]['sub_bucket'][0]['sub_bucket'][j]['key']
					entry['value']  = parseInt(data[i]['sub_bucket'][0]['sub_bucket'][j]['count'],10)
					out.push(entry)
				}
			}
			
			out.columns = ["source", "target", "value"]
			
			const links = out
			const nodes = Array.from(new Set(links.flatMap(l => [l.source, l.target])), name => ({name, category: name}));
			
			console.log({nodes , links, units: ""})
			return {nodes, links, units: ""};
			
	    }
	    
    }
    ).catch(function(error) {
    		console.warn(error);
    });
}
);


  main.define("d3", ["require"], function(require){return(require("d3@6", "d3-sankey@0.12"))})
  
  return main
}
