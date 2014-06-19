var fs = require('fs')

fs.readFile('./refs.json', 'utf8', function(e, json) {
  var refs = JSON.parse(json).map(function(item) {
    return {
      refs: Object.keys(item.refs).map(function(name) {
        return { adapter: name, id: item.refs[name] }
      })
    }
  })

  fs.writeFile('refs.json', JSON.stringify(refs))
})


//=========================================================================//
// This file is part of Eagle.                                             //
//                                                                         //
// Eagle is Copyright 2014 Volary Foundation and Contributors              //
//                                                                         //
// Eagle is free software: you can redistribute it and/or modify it under  //
// the terms of the GNU Affero General Public License as published by the  //
// Free Software Foundation, either version 3 of the License, or (at your  //
// option) any later version.                                              //
//                                                                         //
// Eagle is distributed in the hope that it will be useful, but WITHOUT    //
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or   //
// FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public    //
// License for more details.                                               //
//                                                                         //
// You should have received a copy of the GNU Affero General Public        //
// License along with Eagle.  If not, see <http://www.gnu.org/licenses/>.  //
//=========================================================================//
