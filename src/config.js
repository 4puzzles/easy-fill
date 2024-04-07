const config = [
  {
    path: '/XSCJ/TEA_BKCJ_ADD.aspx',
    keyNames: ['学号', '姓名'],
    dataNames: [ '补考成绩', '备注'],
    pos: {
      top: '30px',
      right: '15%'
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
  }
];

export default config;
