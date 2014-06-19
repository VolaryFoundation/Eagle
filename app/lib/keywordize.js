var _ = require('lodash')

module.exports = function(normalized) {
  var name = normalized.name || '';
  var desc = normalized.description || '';
  normalized.keywords = _.compact((name + ' ' + desc).toLowerCase().split(/\s/).map(function(word) { return word.replace(/(\W)/g, '') }))
  return normalized
}

//===========================================================
// This file is part of Eagle.
//
// Eagle is Copyright 2014 Volary Foundation and Contributors
//
// Eagle is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
//
// Eagle is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License along with Eagle.  If not, see <http://www.gnu.org/licenses/>.
//===========================================================
