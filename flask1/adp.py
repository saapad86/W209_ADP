from flask import Flask,render_template
from flask import request
import pandas as pd
import numpy as np
from pandas.compat import StringIO
import json
import datetime
#import pandas_highcharts
#rom pandas_highcharts.core import serialize

app = Flask(__name__)
app.debug = True

# Helper functions
def extractColumn(df,column):
	return (df[column].apply(lambda x: np.round(x)).to_json(orient='values'))

def extractColumn2(df,index,column):
	return pd.DataFrame(list(zip(index,map(lambda x: np.round(x),df[column]))),columns=['months','data']).values.tolist()

epoch = datetime.datetime.utcfromtimestamp(0)
def unix_time_millis(dt):
    return (dt - epoch).total_seconds() * 1000.0

def applyFilters(df,exclude=None):
	if exclude == 'region':
		region_list = ['us-cncr','us-cner','us-csor','us-cwer']
	else:
		region_list = []
		if filters['filterRegionNortheastOn'] != '':
			region_list.append('us-cner')
		if filters['filterRegionSouthOn'] != '':
			region_list.append('us-csor')
		if filters['filterRegionWestOn'] != '':
			region_list.append('us-cwer')
		if filters['filterRegionMidwestOn'] != '':
			region_list.append('us-cncr')
	df = df[df['hc-key'].isin(region_list)]
	df['jobs'] = df['delta_total']

	if exclude != 'sector':	
		if filters['filterSectorGoodsOn'] == '':
			df['jobs'] = df['jobs'] - df['delta_goods']
		if filters['filterSectorServiceOn'] == '':
			df['jobs'] = df['jobs'] - df['delta_service']
	if exclude != 'industry':	
		if filters['filterIndustryManufacturingOn'] == '':
			df['jobs'] = df['jobs'] - df['delta_manufacturing']
		if filters['filterIndustryResourceOn'] == '':
			df['jobs'] = df['jobs'] - df['delta_resource']
		if filters['filterIndustryProfessionalOn'] == '':
			df['jobs'] = df['jobs'] - df['delta_professional']
		if filters['filterIndustryTradeOn'] == '':
			df['jobs'] = df['jobs'] - df['delta_trade']
	
	return df

@app.route('/')
# make this look like the bls route for the landing page, put the landing page in the static/templates
def hello_world():
    return 'WELCOME TO FLASK!'

@app.route('/bls-ts/')
def bls_ts():
	return render_template('bls-ts.html')

@app.route('/bls-mth/')
def bls_mth():
	return render_template('bls-mth.html')

@app.route('/jobs-explorer/')
@app.route('/jobs-explorer/<topic>',methods=['GET','POST'])
def adp(topic='total',filter='Total'):
	# Define all the filters we are enabling
	filter_labels = ['filterSectorGoodsOn','filterSectorServiceOn','filterIndustryTradeOn','filterIndustryProfessionalOn','filterIndustryResourceOn','filterIndustryManufacturingOn','filterRegionMidwestOn','filterRegionSouthOn','filterRegionWestOn','filterRegionNortheastOn']
	# Initialize them as empty for now...
	filter_values = ['']*len(filter_labels)

	# Initial request will always be a GET; filter actions will come thru as a POST
	filter_inputs = ''
	if request.method == 'POST':
		# Retrieve a list of marked checkboxes from the request
		filter_inputs = request.form.getlist('check')
	else:
		# By default, all checkboxes are marked
		filter_values = ['checked']*len(filter_labels)

	# Create a dictionary with the filter labels and values
	global filters
	filters = dict(zip(filter_labels,filter_values))

	# Loop through all the filter labels and check the input string to see if they should be checked
	if request.method == 'POST':
		for f in filters.keys():
			if f in filter_inputs:
				filters[f] = 'checked'

	df0 = pd.read_csv('static/data/ADP1.csv')

	filter_text = 'Jobs'
	months = pd.Series(map(lambda x: unix_time_millis(x),pd.date_range('1/1/2005',periods=136,freq='M')))

	if topic == 'region':
		df1 = applyFilters(df0,exclude='region')

		jobs_midwest = extractColumn2(df1[df1['hc-key']=='us-cncr'],months,'jobs')
		jobs_northeast = extractColumn2(df1[df1['hc-key']=='us-cner'],months,'jobs')
		jobs_south = extractColumn2(df1[df1['hc-key']=='us-csor'],months,'jobs')
		jobs_west = extractColumn2(df1[df1['hc-key']=='us-cwer'],months,'jobs')

		filter_text = 'Jobs By Region'

		return render_template('adp1.html',topic=topic,filter_text=filter_text,filters=filters,jobs_midwest=jobs_midwest,jobs_northeast=jobs_northeast,jobs_south=jobs_south,jobs_west=jobs_west)
	elif topic == 'industry':
		df1 = applyFilters(df0,exclude='industry').groupby(['month']).agg(np.sum)

		filter_text = 'Jobs By Industry'

		jobs_resource = extractColumn2(df1,months,'delta_resource')
		jobs_manufacturing = extractColumn2(df1,months,'delta_manufacturing')
		jobs_trade = extractColumn2(df1,months,'delta_trade')
		jobs_professional = extractColumn2(df1,months,'delta_professional')

		return render_template('adp1.html',topic=topic,filter_text=filter_text,filters=filters,jobs_resource=jobs_resource,jobs_manufacturing=jobs_manufacturing,jobs_trade=jobs_trade,jobs_professional=jobs_professional)
	elif topic == 'sector':
		df1 = applyFilters(df0,exclude='sector').groupby(['month']).agg(np.sum)

		filter_text = 'Jobs By Sector'

		jobs_goods = extractColumn2(df1,months,'delta_goods')
		jobs_service = extractColumn2(df1,months,'delta_service')

		return render_template('adp1.html',topic=topic,filter_text=filter_text,filters=filters,jobs_goods=jobs_goods,jobs_service=jobs_service)
	elif topic == 'size':
		df1 = applyFilters(df0,exclude='size').groupby(['month']).agg(np.sum)

		filter_text = 'Jobs By Company Size'

		jobs_goods = extractColumn(df1,'delta_goods')
		jobs_service = extractColumn(df1,'delta_service')

		df2 = pd.DataFrame(list(zip(months,map(lambda x: np.round(x),df1['delta_goods']))),columns=['months','delta_goods'])
		data2 = df2.values.tolist()

		return render_template('adp1.html',topic=topic,data2=data2,filter_text=filter_text,filters=filters,jobs_goods=jobs_goods,jobs_service=jobs_service)
	else:
		df1 = applyFilters(df0).groupby(['month']).agg(np.sum)

		filter_text = 'Total Jobs'

		jobs_us = extractColumn2(df1,months,'jobs')

		return render_template('adp1.html',topic=topic,jobs_us=jobs_us,filter_text=filter_text,filters=filters)