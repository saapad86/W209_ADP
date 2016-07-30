from flask import Flask,render_template
from flask import request
import pandas as pd
import numpy as np
import matplotlib as plt
import seaborn as sns
from pandas.compat import StringIO
#import pandas_highcharts
#rom pandas_highcharts.core import serialize

app = Flask(__name__)
app.debug = True

# Helper functions
def extractColumn(df,column):
	return (df[column].apply(lambda x: np.round(x)).to_json(orient='values'))

def checkFilters(filters):
	if ['goodsOn' in filters]:
		goodsOn = 'checked'
	if ['serviceOn' in filters]:
		serviceOn = 'checked'
	if goodsOn == 'checked' and serviceOn == 'checked':
		totalOn = 'checked'
	return 0

@app.route('/')
def hello_world():
    return 'WELCOME TO FLASK!'

@app.route('/bls')
def bls():
	return render_template('bls.html')

@app.route('/adp')
@app.route('/adp/<action>',methods=['GET','POST'])
def adp(action=None):
	df0 = pd.read_csv('static/data/ADP1.csv')
	df1 = df0[df0['hc-key'] == 'us-us']
	months = df1['month'].to_json(orient='values')

	goodsOn = ''
	serviceOn = ''
	totalOn = ''
	if request.method == 'POST':
		filters = request.form.getlist('check')
		if 'goodsOn' not in filters:
			jobs = extractColumn(df1,'delta_service')
			filter_text = 'Services Sector'
			serviceOn = 'checked'
		elif 'serviceOn' not in filters:
			jobs = extractColumn(df1,'delta_goods')
			filter_text = 'Goods Sector'
			goodsOn = 'checked'
		else:
			jobs = extractColumn(df1,'delta_total')
			filter_text = 'Total Jobs'
			goodsOn = 'checked'
			serviceOn = 'checked'
		return render_template('adp1.html',months=months,jobs=jobs,filter_text=filter_text,totalOn=totalOn,goodsOn=goodsOn,serviceOn=serviceOn)
	elif request.method == 'GET':
		jobs = df1['delta_total'].apply(lambda x: np.round(x)).to_json(orient='values')
		filter_text = 'Total Jobs'
		goodsOn = 'checked'
		serviceOn = 'checked'
		totalOn = ''
		return render_template('adp1.html',months=months,jobs=jobs,totalOn=totalOn,goodsOn=goodsOn,serviceOn=serviceOn,filter_text='Total Jobs')