let data = Array(10).fill(10).map((x,i)=>x+i)

let body = d3.select('body')

let ul = body.append('ul')

let li = ul.selectAll('li')
.data(data)
.enter()
.append('li')
.text(d=>d)

// add class for even and odd
li.attr('class', d => d % 2 == 0 ? 'even' : 'odd')

// change color of even and odd
li.style('color', d => d % 2 == 0 ? 'red' : 'blue')
