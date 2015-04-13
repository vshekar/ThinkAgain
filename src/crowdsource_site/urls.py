from django.conf.urls import include, url
from django.contrib import admin


urlpatterns = [
    # Crowdsource site URLS:

    url(r'^$', 'crowdsource_site.views.home', name='home'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^about/','crowdsource_site.views.about', name='about'),
    url(r'^contact/','crowdsource_site.views.contact', name='contact'),
    url(r'^login/', 'crowdsource_site.views.login_site', name='login'),
    url(r'^logout/', 'crowdsource_site.views.logout_site', name='logout'),
    url(r'^register/', 'crowdsource_site.views.register', name='register'),
    url(r'^game/','crowdsource_site.views.game',name='game'),
    url(r'^game_menu/','crowdsource_site.views.game_menu',name='game_menu'),
    url(r'^get_problem_files/','crowdsource_site.views.get_problem_files',name='get_problem_files'),
    url(r'^generate_problem/','crowdsource_site.views.generate_problem',name='generate_problem'),
    # url(r'^blog/', include('blog.urls')),

    
]