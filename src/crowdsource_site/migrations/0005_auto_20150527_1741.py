# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('crowdsource_site', '0004_incompletesolution'),
    ]

    operations = [
        migrations.AddField(
            model_name='incompletesolution',
            name='complete',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='incompletesolution',
            name='timestamp',
            field=models.DateTimeField(default=datetime.datetime(2015, 5, 27, 21, 41, 16, 993000, tzinfo=utc), auto_now_add=True),
            preserve_default=False,
        ),
    ]
