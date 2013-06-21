
	/*
		PolyK library
		url: http://polyk.ivank.net
		Released under MIT licence.
		
		Copyright (c) 2012 Ivan Kuckir

		Permission is hereby granted, free of charge, to any person
		obtaining a copy of this software and associated documentation
		files (the "Software"), to deal in the Software without
		restriction, including without limitation the rights to use,
		copy, modify, merge, publish, distribute, sublicense, and/or sell
		copies of the Software, and to permit persons to whom the
		Software is furnished to do so, subject to the following
		conditions:

		The above copyright notice and this permission notice shall be
		included in all copies or substantial portions of the Software.

		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
		EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
		OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
		NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
		HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
		WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
		FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
		OTHER DEALINGS IN THE SOFTWARE.
	*/

	var PolyK = {};
	
	/*
		Is Polygon self-intersecting?
		
		O(n^2)
	*/
	
	PolyK.IsSimple = function(p)
	{
		var n = p.length>>1;
		if(n<4) return true;
		var a1 = new PolyK._P(), a2 = new PolyK._P();
		var b1 = new PolyK._P(), b2 = new PolyK._P();
		var c = new PolyK._P();
		
		for(var i=0; i<n; i++)
		{
			a1.x = p[2*i  ];
			a1.y = p[2*i+1];
			if(i==n-1)	{ a2.x = p[0    ];  a2.y = p[1    ]; }
			else		{ a2.x = p[2*i+2];  a2.y = p[2*i+3]; }
			
			for(var j=0; j<n; j++)
			{
				if(Math.abs(i-j) < 2) continue;
				if(j==n-1 && i==0) continue;
				if(i==n-1 && j==0) continue;
				
				b1.x = p[2*j  ];
				b1.y = p[2*j+1];
				if(j==n-1)	{ b2.x = p[0    ];  b2.y = p[1    ]; }
				else		{ b2.x = p[2*j+2];  b2.y = p[2*j+3]; }
				
				if(PolyK._GetLineIntersection(a1,a2,b1,b2,c) != null) return false;
			}
		}
		return true;
	}
	
	PolyK.IsConvex = function(p)
	{
		if(p.length<6) return true;
		var l = p.length - 4;
		for(var i=0; i<l; i+=2)
			if(!PolyK._convex(p[i], p[i+1], p[i+2], p[i+3], p[i+4], p[i+5])) return false;
		if(!PolyK._convex(p[l  ], p[l+1], p[l+2], p[l+3], p[0], p[1])) return false;
		if(!PolyK._convex(p[l+2], p[l+3], p[0  ], p[1  ], p[2], p[3])) return false;
		return true;
	}
	
	PolyK.GetArea = function(p)
	{
		if(p.length <6) return 0;
		var l = p.length - 2;
		var sum = 0;
		for(var i=0; i<l; i+=2)
			sum += (p[i+2]-p[i]) * (p[i+1]+p[i+3]);
		sum += (p[0]-p[l]) * (p[l+1]+p[1]);
		return - sum * 0.5;
	}
	
	PolyK.GetAABB = function(p)
	{
		var minx = Infinity; 
		var miny = Infinity;
		var maxx = -minx;
		var maxy = -miny;
		for(var i=0; i<p.length; i+=2)
		{
			minx = Math.min(minx, p[i  ]);
			maxx = Math.max(maxx, p[i  ]);
			miny = Math.min(miny, p[i+1]);
			maxy = Math.max(maxy, p[i+1]);
		}
		return {x:minx, y:miny, width:maxx-minx, height:maxy-miny};
	}
	
	PolyK.Triangulate = function(p)
	{
		var n = p.length>>1;
		if(n<3) return [];
		var tgs = [];
		var avl = [];
		for(var i=0; i<n; i++) avl.push(i);
		
		var i = 0;
		var al = n;
		while(al > 3)
		{
			var i0 = avl[(i+0)%al];
			var i1 = avl[(i+1)%al];
			var i2 = avl[(i+2)%al];
			
			var ax = p[2*i0],  ay = p[2*i0+1];
			var bx = p[2*i1],  by = p[2*i1+1];
			var cx = p[2*i2],  cy = p[2*i2+1];
			
			var earFound = false;
			if(PolyK._convex(ax, ay, bx, by, cx, cy))
			{
				earFound = true;
				for(var j=0; j<al; j++)
				{
					var vi = avl[j];
					if(vi==i0 || vi==i1 || vi==i2) continue;
					if(PolyK._PointInTriangle(p[2*vi], p[2*vi+1], ax, ay, bx, by, cx, cy)) {earFound = false; break;}
				}
			}
			if(earFound)
			{
				tgs.push(i0, i1, i2);
				avl.splice((i+1)%al, 1);
				al--;
				i= 0;
			}
			else if(i++ > 3*al) break;		// no convex angles :(
		}
		tgs.push(avl[0], avl[1], avl[2]);
		return tgs;
	}
	
	PolyK.ContainsPoint = function(p, px, py)
	{
		var n = p.length>>1;
		var ax, ay, bx = p[2*n-2]-px, by = p[2*n-1]-py;
		var depth = 0;
		for(var i=0; i<n; i++)
		{
			ax = bx;  ay = by;
			bx = p[2*i  ] - px;
			by = p[2*i+1] - py;
			if(ay< 0 && by< 0) continue;	// both "up" or both "donw"
			if(ay>=0 && by>=0) continue;	// both "up" or both "donw"
			if(ax< 0 && bx< 0) continue; 
			
			var lx = ax + (bx-ax)*(-ay)/(by-ay);
			if(lx>0) depth++;
		}
		return (depth & 1) == 1;
	}
	
	PolyK.Slice = function(p, ax, ay, bx, by)
	{
		if(PolyK.ContainsPoint(p, ax, ay) || PolyK.ContainsPoint(p, bx, by)) return [p.slice(0)];

		var a = new PolyK._P(ax, ay);
		var b = new PolyK._P(bx, by);
		var iscs = [];	// intersections
		var ps = [];	// points
		for(var i=0; i<p.length; i+=2) ps.push(new PolyK._P(p[i], p[i+1]));
		
		for(var i=0; i<ps.length; i++)
		{
			var isc = new PolyK._P(0,0);
			isc = PolyK._GetLineIntersection(a, b, ps[i], ps[(i+1)%ps.length], isc);
			
			if(isc)
			{
				isc.flag = true;
				iscs.push(isc);
				ps.splice(i+1,0,isc);
				i++;
			}
		}
		if(iscs.length == 0) return [p.slice(0)];
		var comp = function(u,v) {return PolyK._P.dist(a,u) - PolyK._P.dist(a,v); }
		iscs.sort(comp);
		
		var pgs = [];
		var dir = 0;
		while(iscs.length > 0)
		{
			var n = ps.length;
			var i0 = iscs[0];
			var i1 = iscs[1];
			var ind0 = ps.indexOf(i0);
			var ind1 = ps.indexOf(i1);
			var solved = false;
			
			if(PolyK._firstWithFlag(ps, ind0) == ind1) solved = true;
			else
			{
				i0 = iscs[1];
				i1 = iscs[0];
				ind0 = ps.indexOf(i0);
				ind1 = ps.indexOf(i1);
				if(PolyK._firstWithFlag(ps, ind0) == ind1) solved = true;
			}
			if(solved)
			{
				dir--;
				var pgn = PolyK._getPoints(ps, ind0, ind1);
				pgs.push(pgn);
				ps = PolyK._getPoints(ps, ind1, ind0);
				i0.flag = i1.flag = false;
				iscs.splice(0,2);
				if(iscs.length == 0) pgs.push(ps);
			}
			else { dir++; iscs.reverse(); }
			if(dir>1) break;
		}
		var result = [];
		for(var i=0; i<pgs.length; i++)
		{
			var pg = pgs[i];
			var npg = [];
			for(var j=0; j<pg.length; j++) npg.push(pg[j].x, pg[j].y);
			result.push(npg);
		}
		return result;
	}
	
	PolyK.Raycast = function(p, x, y, dx, dy, isc)
	{
		var l = p.length - 2;
		var tp = PolyK._tp;
		var a1 = tp[0], a2 = tp[1], 
		b1 = tp[2], b2 = tp[3], c = tp[4];
		a1.x = x; a1.y = y;
		a2.x = x+dx; a2.y = y+dy;
		
		if(isc==null) isc = {dist:0, edge:0, norm:{x:0, y:0}, refl:{x:0, y:0}};
		isc.dist = Infinity;
		
		for(var i=0; i<l; i+=2)
		{
			b1.x = p[i  ];  b1.y = p[i+1];
			b2.x = p[i+2];  b2.y = p[i+3];
			var nisc = PolyK._RayLineIntersection(a1, a2, b1, b2, c);
			if(nisc) PolyK._updateISC(dx, dy, a1, b1, b2, c, i/2, isc);
		}
		b1.x = b2.x;  b1.y = b2.y;
		b2.x = p[0];  b2.y = p[1];
		var nisc = PolyK._RayLineIntersection(a1, a2, b1, b2, c);
		if(nisc) PolyK._updateISC(dx, dy, a1, b1, b2, c, p.length/2, isc);
		
		return (isc.dist != Infinity) ? isc : null;
	}
	
	PolyK.ClosestEdge = function(p, x, y, isc)
	{
		var l = p.length - 2;
		var tp = PolyK._tp;
		var a1 = tp[0], 
		b1 = tp[2], b2 = tp[3], c = tp[4];
		a1.x = x; a1.y = y;
		
		if(isc==null) isc = {dist:0, edge:0, point:{x:0, y:0}, norm:{x:0, y:0}};
		isc.dist = Infinity;
		
		for(var i=0; i<l; i+=2)
		{
			b1.x = p[i  ];  b1.y = p[i+1];
			b2.x = p[i+2];  b2.y = p[i+3];
			PolyK._pointLineDist(a1, b1, b2, i>>1, isc);
		}
		b1.x = b2.x;  b1.y = b2.y;
		b2.x = p[0];  b2.y = p[1];
		PolyK._pointLineDist(a1, b1, b2, l>>1, isc);
		
		var idst = 1/isc.dist;
		isc.norm.x = (x-isc.point.x)*idst;
		isc.norm.y = (y-isc.point.y)*idst;
		return isc;
	}
	
	PolyK._pointLineDist = function(p, a, b, edge, isc)
	{
		var x = p.x, y = p.y, x1 = a.x, y1 = a.y, x2 = b.x, y2 = b.y;
		
		var A = x - x1;
		var B = y - y1;
		var C = x2 - x1;
		var D = y2 - y1;

		var dot = A * C + B * D;
		var len_sq = C * C + D * D;
		var param = dot / len_sq;

		var xx, yy;

		if (param < 0 || (x1 == x2 && y1 == y2)) {
			xx = x1;
			yy = y1;
		}
		else if (param > 1) {
			xx = x2;
			yy = y2;
		}
		else {
			xx = x1 + param * C;
			yy = y1 + param * D;
		}

		var dx = x - xx;
		var dy = y - yy;
		var dst = Math.sqrt(dx * dx + dy * dy);
		if(dst<isc.dist)
		{
			isc.dist = dst;
			isc.edge = edge;
			isc.point.x = xx;
			isc.point.y = yy;
		}
	}
	
	PolyK._updateISC = function(dx, dy, a1, b1, b2, c, edge, isc)
	{
		var nrl = PolyK._P.dist(a1, c);
		if(nrl<isc.dist)
		{
			var ibl = 1/PolyK._P.dist(b1, b2);
			var nx = -(b2.y-b1.y)*ibl;
			var ny =  (b2.x-b1.x)*ibl;
			var ddot = 2*(dx*nx+dy*ny);
			isc.dist = nrl;
			isc.norm.x = nx;  
			isc.norm.y = ny; 
			isc.refl.x = -ddot*nx+dx;
			isc.refl.y = -ddot*ny+dy;
			isc.edge = edge;
		}
	}
	
	PolyK._getPoints = function(ps, ind0, ind1)
	{
		var n = ps.length;
		var nps = [];
		if(ind1<ind0) ind1 += n;
		for(var i=ind0; i<= ind1; i++) nps.push(ps[i%n]);
		return nps;
	}
	
	PolyK._firstWithFlag = function(ps, ind)
	{
		var n = ps.length;
		while(true)
		{
			ind = (ind+1)%n;
			if(ps[ind].flag) return ind;
		}
	}
	
	PolyK._PointInTriangle = function(px, py, ax, ay, bx, by, cx, cy)
	{
		var v0x = cx-ax;
		var v0y = cy-ay;
		var v1x = bx-ax;
		var v1y = by-ay;
		var v2x = px-ax;
		var v2y = py-ay;
		
		var dot00 = v0x*v0x+v0y*v0y;
		var dot01 = v0x*v1x+v0y*v1y;
		var dot02 = v0x*v2x+v0y*v2y;
		var dot11 = v1x*v1x+v1y*v1y;
		var dot12 = v1x*v2x+v1y*v2y;
		
		var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
		var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
		var v = (dot00 * dot12 - dot01 * dot02) * invDenom;

		// Check if point is in triangle
		return (u >= 0) && (v >= 0) && (u + v < 1);
	}
	
	PolyK._RayLineIntersection = function(a1, a2, b1, b2, c)
	{
		var dax = (a1.x-a2.x), dbx = (b1.x-b2.x);
		var day = (a1.y-a2.y), dby = (b1.y-b2.y);

		var Den = dax*dby - day*dbx;
		if (Den == 0) return null;	// parallel
		
		var A = (a1.x * a2.y - a1.y * a2.x);
		var B = (b1.x * b2.y - b1.y * b2.x);
		
		var I = c;
		var iDen = 1/Den;
		I.x = ( A*dbx - dax*B ) * iDen;
		I.y = ( A*dby - day*B ) * iDen;
		
		if(!PolyK._InRect(I, b1, b2)) return null;
		if((day>0 && I.y>a1.y) || (day<0 && I.y<a1.y)) return null; 
		if((dax>0 && I.x>a1.x) || (dax<0 && I.x<a1.x)) return null; 
		return I;
	}
	
	PolyK._GetLineIntersection = function(a1, a2, b1, b2, c)
	{
		var dax = (a1.x-a2.x), dbx = (b1.x-b2.x);
		var day = (a1.y-a2.y), dby = (b1.y-b2.y);

		var Den = dax*dby - day*dbx;
		if (Den == 0) return null;	// parallel
		
		var A = (a1.x * a2.y - a1.y * a2.x);
		var B = (b1.x * b2.y - b1.y * b2.x);
		
		var I = c;
		I.x = ( A*dbx - dax*B ) / Den;
		I.y = ( A*dby - day*B ) / Den;
		
		if(PolyK._InRect(I, a1, a2) && PolyK._InRect(I, b1, b2)) return I;
		return null;
	}
	
	PolyK._InRect = function(a, b, c)
	{
		if	(b.x == c.x) return (a.y>=Math.min(b.y, c.y) && a.y<=Math.max(b.y, c.y));
		if	(b.y == c.y) return (a.x>=Math.min(b.x, c.x) && a.x<=Math.max(b.x, c.x));
		
		if(a.x >= Math.min(b.x, c.x) && a.x <= Math.max(b.x, c.x)
		&& a.y >= Math.min(b.y, c.y) && a.y <= Math.max(b.y, c.y)) 
		return true;
		return false;
	}
	
	PolyK._convex = function(ax, ay, bx, by, cx, cy)
	{
		return (ay-by)*(cx-bx) + (bx-ax)*(cy-by) >= 0;
	}
		
	PolyK._P = function(x,y)
	{
		this.x = x;
		this.y = y;
		this.flag = false;
	}
	PolyK._P.prototype.toString = function()
	{
		return "Point ["+this.x+", "+this.y+"]";
	}
	PolyK._P.dist = function(a,b)
	{
		var dx = b.x-a.x;
		var dy = b.y-a.y;
		return Math.sqrt(dx*dx + dy*dy);
	}
	
	PolyK._tp = [];
	for(var i=0; i<10; i++) PolyK._tp.push(new PolyK._P(0,0));