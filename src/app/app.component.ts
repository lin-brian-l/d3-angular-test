import { ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, AfterViewInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';

class Post {
  date: string | Date;
  score: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements AfterViewInit {
  @ViewChild('chart') chartElement: ElementRef;

  parseDate = d3.timeParse('%m-%d-%Y');
  bisectDate = d3.bisector((d: Post) => {
    return d.date;
  }).left;

  private svgElement: HTMLElement;
  private chartProps: any;
  public posts: Post[] = [
    {
      date: '10-05-2012',
      score: 100
    },
    {
      date: '10-07-2012',
      score: 110
    },
    {
      date: '10-09-2012',
      score: 150
    },
    {
      date: '10-10-2012',
      score: 50
    },
    {
      date: '10-12-2012',
      score: 70
    },
    {
      date: '10-15-2012',
      score: 170
    },
  ];

  constructor() { }

  ngAfterViewInit() {
    this.buildChart();
  }

  formatDate() {
    this.posts.forEach(ms => {
      if (typeof ms.date === 'string') {
        ms.date = this.parseDate(ms.date);
      }
    });
  }

  buildChart() {
    this.chartProps = {};
    this.formatDate();

    // Set the dimensions of the canvas / graph
    var margin = { top: 30, right: 20, bottom: 30, left: 50 },
      width = 600 - margin.left - margin.right,
      height = 270 - margin.top - margin.bottom;

    // Set the ranges
    this.chartProps.x = d3.scaleTime().range([0, width]);
    this.chartProps.y = d3.scaleLinear().range([height, 0]);

    // Define the axes
    var xAxis = d3.axisBottom(this.chartProps.x);
    var yAxis = d3.axisLeft(this.chartProps.y).ticks(5);

    let _this = this;

    // Define the line
    var valueline = d3.line<Post>()
      .x(function (d) {
        if (d.date instanceof Date) {
          return _this.chartProps.x(d.date.getTime());
        }
      })
      .y(function (d) { console.log('Close market'); return _this.chartProps.y(d.score); });

    // Define the line
    var valueline2 = d3.line<Post>()
      .x(function (d) {
        if (d.date instanceof Date) {
          return _this.chartProps.x(d.date.getTime());
        }
      })
      .y(function (d) { console.log('Open market'); return _this.chartProps.y(d.score); });

    var svg = d3.select(this.chartElement.nativeElement)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scale the range of the data
    this.chartProps.x.domain(
      d3.extent(_this.posts, function (d) {
        if (d.date instanceof Date)
          return (d.date as Date).getTime();
      }));
    this.chartProps.y.domain([0, d3.max(this.posts, function (d) {
      return Math.max(d.score);
    })]);

    // Add the valueline2 path.
    svg.append('path')
      .attr('class', 'line line2')
      .style('stroke', 'green')
      .style('fill', 'none')
      .attr('d', valueline2(_this.posts));

    // Add the valueline path.
    svg.append('path')
      .attr('class', 'line line1')
      .style('stroke', 'black')
      .style('fill', 'none')
      .attr('d', valueline(_this.posts));

    // Add the X Axis
    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    // Add the Y Axis
    svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis);

    let focus = svg.append('g').style('display', 'none');

    focus.append('circle')
      .attr('class', 'y')
      .style('fill', 'none')
      .style('stroke', 'blue')
      .attr('r', 4);


    const mousemove = () => {
      var x0 = this.chartProps.x.invert(d3.mouse(this.chartElement.nativeElement)[0]),
        i = this.bisectDate(this.posts, x0, 1),
        d0:any = this.posts[i - 1],
        d1:any = this.posts[i],
        d = x0 - d0.date > d1.date - x0 ? d1 : d0;

        focus.select('circle.y')
          .attr('transform', `translate(${this.chartProps.x(d.date)}, ${this.chartProps.y(d.score)})`)
    }

    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', function () { focus.style('display', null); })
      .on('mouseout', function () { focus.style('display', 'none'); })
      .on('mousemove', mousemove);

    // Setting the required objects in chartProps so they could be used to update the chart
    this.chartProps.svg = svg;
    this.chartProps.valueline = valueline;
    this.chartProps.valueline2 = valueline2;
    this.chartProps.xAxis = xAxis;
    this.chartProps.yAxis = yAxis;
  }
}
