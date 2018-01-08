var express = require('express');
var router = express.Router();
const mutation = 10;
const generations = 300;
const threshold = 1000;
const weights = {
	std : 3,
	median: 3,
	mean: 2,
	min: 0.5,
	max: 0.5
}
var state;

router.get('/', function(req, res){
	
	res.render('index');
});

router.post('/', function(req, res){
	var dakine = {'msg': "hi"};

	state = req.body;

	var dist = findDistribution();
	dist.sort();
  
    var data = Array(dist.length + 1);
    data[0] = ["", ""];
    for(var i = 1; i < data.length; i++){
    	data[i] = [null, dist[i-1]];
    }

	results = {
		std : standardDev(dist).toFixed(2),
		median : dist[Math.floor(dist.length/2)],
		mean : average(dist).toFixed(2),
		min : dist[0],
		max : dist[dist.length-1],
	    personal : search(dist, 0, dist.length-1, state.personal),
	    data : data
	}
	//console.log(JSON.stringify(results));
	res.send(results);
});

function printArr(array){
	for(var i = 0; i < array.length; i++){
		process.stdout.write(array[i].toString() +  " ");
	}
	console.log();
}

function findDistribution(){
	var population = generateFirstPopulation(state.min, state.max, state.people, 50);
	var i = 0;
	do{
		let fittest = findTheFittest(population);
		let culled = cull(fittest, population);
		population = createNextPopulation(culled);
		i++;
	} while(i < generations-1);
	let fittest = findTheFittest(population);
	return population[fittest[fittest.length-1][1]];
}

function generateFirstPopulation(min, max, num, pop){
	var population = new Array(pop)
	for(let i = 0; i < pop; i++){
		population[i] = new Array(num);
		for(let j = 0; j < num; j++){
			population[i][j] = Math.floor(Math.random() * (max - min + 1)) + min;
		}
		population[i].sort();
	}
	return population;
};

function findTheFittest(population){
	var fittest = new Array(population.length);
	for(var i = 0; i < population.length; i++){
		fittest[i] = new Array(2);
		fittest[i][0] = getFitness(population[i]);
		fittest[i][1] = i;
	}

	fittest.sort(function(a, b){ 
		return a[0] < b[0] ? -1 : (a[0] == b[0] ? 0 : 1);
	});
	return fittest;
};

function cull(fitness, population){
	culled = new Array(fitness.length/2);
	for(var i = 0; i < fitness.length/2; i++){
		culled[i] = new Array(population[0].length);
		culled[i] = population[fitness[i + Math.floor(fitness.length/2)][1]];
	}
	return culled;
}

//parents array is the culled population
function createNextPopulation(parents){
	var children = new Array(2*parents.length);
	for(var i = 0, j = 0; i < parents.length; i++, j+=2){
		let index1 = Math.floor(Math.random() * parents.length/2) + Math.floor(parents.length/2);
		let index2 = Math.floor(Math.random() * parents.length/2) + Math.floor(parents.length/2);
		let parent1 = parents[index1];
		let parent2 = parents[index2];
		parent1.sort();
		parent2.sort();
		children[j] = reproduce(parent1, parent2);
		children[j+1] = reproduce(parent2, parent1);	
		mutate(children[j]);
		mutate(children[j+1]);
	}
	children[0] = parents[parents.length-1];
	return children;
}

function reproduce(parent1, parent2){
	var child = new Array(parent1.length);
	for(var i = 0; i < parent1.length; i++){
		child[i] = i % 2 == 0 ? parent1[i] : parent2[i];
	}
	return child;
}

function mutate(array){
	for(var i = 0; i < array.length; i++){
		var fate = Math.floor(Math.random() * 100);
		if(fate < mutation*2){
			array[i] = array[i] + Math.floor(2*Math.random() - 0.5);
		} else if(fate < mutation * 3.5){
			array[i] = array[i] + Math.floor(4*Math.random() - 1.5);
		} else if(fate < mutation * 4.0){
			array[i] = array[i] + Math.floor(6*Math.random() - 2.5);
		} else if(fate < mutation * 4.5){
			array[i] = array[i] + Math.floor(8*Math.random() - 3.5);
		} else if(fate < mutation * 5.0){
			array[i] = array[i] + Math.floor(10*Math.random() - 4.5);
		}
		if(array[i] < state.min){
			array[i] = Math.floor(state.min);
		}
		if(array[i] > state.max){
			array[i] = Math.floor(state.max);
		}
	}
}

function getFitness(array){
	var fitness = 1000;
	array.sort();
	fitness -= 2 * weights.std * Math.pow(state.std - standardDev(array), 2);
	fitness -= weights.mean * Math.pow(state.mean - average(array), 2);
	fitness -= weights.median * Math.pow(state.median - array[Math.floor(array.length/2)], 2);
	fitness -= weights.min * Math.pow(state.min - array[0], 2);
	fitness -= weights.max * Math.pow(state.max - array[array.length-1], 2);
	return Math.floor(fitness);
}

function standardDev(sample){
	var mean = average(sample);
	var std = 0.0;
	for(var i = 0; i < sample.length; i++){
		std += (sample[i] - mean)*(sample[i] - mean);
	}
	return Math.sqrt(std/(sample.length-1));
}

function average(sample){
	var sum = 0.0;
	for(var i = 0; i < sample.length; i++){
		sum += sample[i];
	}
	return sum/sample.length;
}

function search(sample, min, max, num){
	if(min >= max || max >= sample.length)
		return Math.floor(100.0*max/sample.length);
		
	var mid = Math.floor((min+max)/2);
	if(sample[mid] == num)
		return Math.floor(100.0*mid/sample.length);
	else if(sample[mid] < num)
		return search(sample, mid+1, max, num);
	else 
		return search(sample, min, mid, num);
}


module.exports = router;