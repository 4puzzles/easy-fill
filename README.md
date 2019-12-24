# easy-fill
ease-fill is a chrome extension for fast data entry (GDBTU only). It won't modify any data or have any side effects. It just finds out the matched record and fills with ths scores. 


## Usage

### Step 1

Prepare an excel file with formatted data. The first row **MUST** constain "学号", "姓名", "平时", "中考", "末考", "技能" and "综合". Here is an example.

![Sample Picture](sample/sample.JPG)

### Step 2

Open the website page and upload the excel file. Parse the excel file.

### Step 3

Click "fill" button. The extension will compare "学号" and "姓名" with the record. If one of them doesn't match the record, the scores won't be filled.