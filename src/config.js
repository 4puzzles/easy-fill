const config = [
  {
    path: '/XSCJ/TEA_BKCJ_ADD.aspx',
    keyNames: ['学号', '姓名'],
    dataNames: [ '补考成绩', '备注'],
    style: {
      position: 'absolute',
      top: '30px',
      right: '15%'
    },
    inject(id) {
      const el = document.createElement('div');
      el.id = id;
      document.body.appendChild(el);
      return el;
    },
    _rows: null,
    init() {
      const targetDoc = window.frames['frmRpt'].document;
      const targetTable = targetDoc.querySelector('table:last-child');
      if(!targetTable) {
        throw new ReferenceError('target area does not exist', {
          cause: {
            targetDoc,
            targetTable
          }
        })
      }
      this._rows = targetTable.querySelectorAll('tr');
    },
    * rows() {
      class Row {
        constructor(nth, row) {
          this.nth = nth;
          this.row = row;
        }
        executeCallback(name, element) {
          const targetWindow = window.frames['frmRpt'];
          if(name === '补考成绩') {
            targetWindow.getselblur(this.nth, 1, element);
          } else if(name === '备注') {
            targetWindow.settsqk(this.nth, 'QM', element)
          }
        }
        setDataValue(name, value) {
          if(name === '补考成绩') {
            const input = this.row.querySelector(`input[name="CHKQMCJ${this.nth}"]`);
            if(input.hasAttribute('readonly') || input.hasAttribute('diabled')) {
              return false;
            }
            value = Number(value);
            if(!isNaN(value)) {
              input.value =  value;
              this.executeCallback(name, input);
              return true;
            }
          } else if(name === '备注') {
            value = (value ?? '').toString().trim();
            const select = this.row.querySelector(`#sel_QMTSQK${this.nth}`);
            const options = select.querySelectorAll('option');
            for(const option of options) {
              if(option.textContent.trim() === value) {
                if(option.selected === true) {
                  return false;
                }
                option.selected = true;
                this.executeCallback(name, select);
                return true;
              }
            }
          }

          return false;
        }
        getKeyValue(name) {
          if(name === '学号') {
            return this.row.querySelector('td:nth-child(2)').textContent.trim();
          } else if(name === '姓名') {
            return this.row.querySelector('td:nth-child(3)').textContent.trim();
          } else {
            return undefined;
          }
        }
        tryFillRowData(rowJSON) {
          // check key fields
          for(const keyName of ['学号', '姓名']) {
            const keyJSONValue = (rowJSON[keyName] ?? '').toString().trim();
            if(keyJSONValue != this.getKeyValue(keyName)) {
              return false;
            }
          }

          let isset = false;
          // fill '备注' first
          if(('备注' in rowJSON) && this.setDataValue('备注', rowJSON['备注'])) {
            isset = true;
          }
          if(('补考成绩' in rowJSON) && this.setDataValue('补考成绩', rowJSON['补考成绩'])) {
            isset = true;
          }
          return  isset;
        }
      };
      for(let i=0; i<this._rows.length; ++i) {
        yield new Row(i+1, this._rows[i]);
      }
    }
  },
  {
    path: '/XSCJ/Tea_KCCJLR_add_temp.aspx',
    style: {
      display: 'inline-block',
      position: 'relative',
      top: '3px',
      left: '20px'

    },
    inject(id) {
      const el = document.createElement('span');
      el.id = id;
      document.querySelector('table tbody tr:nth-child(2) table table tr:nth-child(3) td').appendChild(el);
      return el;
    },
    _rows: null,
    init() {
      const targetDoc = window.frames['frmRpt'].document;
      const targetTable = targetDoc.querySelector('table:last-child');
      if(!targetTable) {
        throw new ReferenceError('target area does not exist', {
          cause: {
            targetDoc,
            targetTable
          }
        })
      }
      this._rows = targetTable.querySelectorAll('tr[id^="hh"]');
    },
    * rows() {
      class Row {
        constructor(nth, row) {
          this.nth = nth;
          this.row = row;
        }
        executeCallback(name, element) {
          const targetWindow = window.frames['frmRpt'];

          // getBFselblur is a predefined function
          // when the user inputs a score, the function will be called
          // and the final score will be calculated
          // here we just simulate the same situation
          if(name === '备注') {
            targetWindow.settsqk(this.nth, 'QM', element)
          } else {
            targetWindow.getBFselblur(String(this.nth), '1', '1', element);
          }
        }
        setDataValue(name, value) {
          if(name === '平时' || name === '末考') {
            const input = name==='平时' ? this.row.querySelector(`#CHKPSCJ${this.nth}`) : this.row.querySelector(`#CHKQMCJ${this.nth}`);
            if(input.hasAttribute('readonly') || input.hasAttribute('diabled')) {
              return false;
            }
            value = Number(value);
            if(!isNaN(value)) {
              input.value =  value;
              this.executeCallback(name, input);
              return true;
            }
          } else if(name === '备注') {
            value = (value ?? '').toString().trim();
            const select = this.row.querySelector(`#sel_QMTSQK${this.nth}`);
            const options = select.querySelectorAll('option');
            for(const option of options) {
              if(option.textContent.trim() === value) {
                if(option.selected === true) {
                  return false;
                }
                option.selected = true;
                this.executeCallback(name, select);
                return true;
              }
            }
          }

          return false;
        }
        getKeyValue(name) {
          if(name === '学号') {
            return this.row.querySelector('td:nth-child(2)').textContent.trim();
          } else if(name === '姓名') {
            return this.row.querySelector('td:nth-child(3)').textContent.trim();
          } else {
            return undefined;
          }
        }
        tryFillRowData(rowJSON) {
          // check key fields
          for(const keyName of ['学号', '姓名']) {
            const keyJSONValue = (rowJSON[keyName] ?? '').toString().trim();
            if(keyJSONValue != this.getKeyValue(keyName)) {
              return false;
            }
          }

          let isset = false;
          // fill '备注' first
          if(('备注' in rowJSON) && this.setDataValue('备注', rowJSON['备注'])) {
            isset = true;
          }
          if(('平时' in rowJSON) && this.setDataValue('平时', rowJSON['平时'])) {
            isset = true;
          }
          if(('末考' in rowJSON) && this.setDataValue('末考', rowJSON['末考'])) {
            isset = true;
          }
          return  isset;
        }
      };
      for(let i=0; i<this._rows.length; ++i) {
        yield new Row(i+1, this._rows[i]);
      }
    }

  }
];

export default config;
