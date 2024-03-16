from locust import HttpUser, task

class SkiUser(HttpUser):
    @task
    def satellite(self):
        self.client.get("/")
        self.client.get("/ski/")
        self.client.get("/ski/2023-11-23_SatelliteImageryMtHood.html")

    @task
    def glance(self):
        self.client.get("/")
        self.client.get("/ski/")
        self.client.get("/glances/2023-22-23_mt_hood_ski.html")

    @task
    def checklist(self):
        self.client.get("/")
        self.client.get("/ski/")
        self.client.get("/ski/2023-11-17_PreTripChecklist.html")