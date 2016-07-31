from flask import Flask,render_template
from flask import request
import pandas as pd
import numpy as np
import matplotlib as plt
import seaborn as sns
from pandas.compat import StringIO
import json
#import pandas_highcharts
#rom pandas_highcharts.core import serialize

app = Flask(__name__)
app.debug = True

# Helper functions
def extractColumn(df,column):
	return (df[column].apply(lambda x: np.round(x)).to_json(orient='values'))

def applyFilters(df):
	df['jobs'] = df['delta_total']
	if filters['filterSectorGoodsOn'] == '':
		df['jobs'] = df['jobs'] - df['delta_goods']
	if filters['filterSectorServiceOn'] == '':
		df['jobs'] = df['jobs'] - df['delta_service']

	if filters['filterIndustryManufacturingOn'] == '':
		df['jobs'] = df['jobs'] - df['delta_manufacturing']
	if filters['filterIndustryResourceOn'] == '':
		df['jobs'] = df['jobs'] - df['delta_resource']
	if filters['filterIndustryProfessionalOn'] == '':
		df['jobs'] = df['jobs'] - df['delta_professional']
	if filters['filterIndustryTradeOn'] == '':
		df['jobs'] = df['jobs'] - df['delta_trade']

	# if 'filterRegionNortheastOn' not in filters:
	# 	df['jobs'] = df['jobs'] - df['delta_trade']
	# if 'filterRegionSouthOn' not in filters:
	# 	df['jobs'] = df['jobs'] - df['delta_trade']
	# if 'filterRegionWestOn' not in filters:
	# 	df['jobs'] = df['jobs'] - df['delta_trade']
	# if 'filterRegionMidwestOn' not in filters:
	# 	df['jobs'] = df['jobs'] - df['delta_trade']

	return df


@app.route('/')
def hello_world():
    return 'WELCOME TO FLASK!'

@app.route('/bls')
def bls():
	return render_template('bls.html')

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

	import datetime
	epoch = datetime.datetime.utcfromtimestamp(0)
	def unix_time_millis(dt):
	    return (dt - epoch).total_seconds() * 1000.0

	months = pd.Series(map(lambda x: unix_time_millis(x),pd.date_range('1/1/2005',periods=136,freq='M'))).tolist()

	if topic == 'region':
		df1 = df0[df0['hc-key'].isin(['us-cncr','us-cner','us-csor','us-cwer'])]
		df1 = applyFilters(df1)

		jobs_midwest = extractColumn(df1[df1['hc-key']=='us-cncr'],'jobs')
		jobs_northeast = extractColumn(df1[df1['hc-key']=='us-cner'],'jobs')
		jobs_south = extractColumn(df1[df1['hc-key']=='us-csor'],'jobs')
		jobs_west = extractColumn(df1[df1['hc-key']=='us-cwer'],'jobs')

		return render_template('adp1.html',topic=topic,months=months,filter_text=filter_text,filters=filters,jobs_midwest=jobs_midwest,jobs_northeast=jobs_northeast,jobs_south=jobs_south,jobs_west=jobs_west)
	else:
		df1 = df0[df0['hc-key'].isin(['us-us'])]
		df1 = applyFilters(df1)

		jobs_us = extractColumn(df1[df1['hc-key']=='us-us'],'jobs')

		return render_template('adp1.html',topic=topic,months=months,jobs_us=jobs_us,filter_text=filter_text,filters=filters)