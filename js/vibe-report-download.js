// Vibe Report Download

// Generate the report link
function generateLink() {
  var site = encodeURIComponent(document.getElementById("siteVibeDownload").value);
  var timezone = encodeURIComponent(document.getElementById("timezone").value);
  var workgroupsSelect = document.getElementById("workgroupsVibeDownload");
  var dateRange = document.getElementById("daterange").value;
  var dates = dateRange.split(" to ");
  var startDate = encodeURIComponent(dates[0]);
  var endDate = encodeURIComponent(dates[1]);

  // Existing selected workgroups
  var selectedWorkgroups = Array.from(workgroupsSelect.selectedOptions)
    .map((option) => "workGroups=" + encodeURIComponent(option.value))
    .join("&");

  // Static workgroups to be always included
  var staticWorkgroups = [
    "NACS LOA",
    "Support/Non-Production",
    "Temp Holding Workgroup",
  ]
    .map((wg) => "workGroups=" + encodeURIComponent(wg))
    .join("&");

  // If there are selected workgroups, add an '&' before appending static workgroups
  if (selectedWorkgroups.length > 0) {
    selectedWorkgroups += "&" + staticWorkgroups;
  } else {
    selectedWorkgroups = staticWorkgroups;
  }

  var baseLink =
    "https://vibe.a2z.com/reportsandanalytics/reports?reportType=User%20Schedules&sites=";
  var staticText =
    "&cssmUsername=&scheduleIntervalTypeNames=Break&scheduleIntervalTypeNames=Lunch&scheduleIntervalTypeNames=Non-Productive%20Time&scheduleIntervalTypeNames=Overtime&scheduleIntervalTypeNames=Peer%20Swap-in&scheduleIntervalTypeNames=Peer%20Swap-out&scheduleIntervalTypeNames=Time-off&scheduleIntervalTypeNames=Planned%20Time-off&scheduleIntervalTypeNames=Voluntary%20Time-off&scheduleIntervalTypeNames=Work&scheduleIntervalStatusNames=Approved&scheduleIntervalStatusNames=Mandatory";

  var downloadLink =
    baseLink +
    site +
    "&" +
    selectedWorkgroups +
    "&startDate=" +
    startDate +
    "&endDate=" +
    endDate +
    "&timeZone=" +
    timezone +
    staticText;

  // Open the link in a new tab
  window.open(downloadLink, "_blank");
}

// Flatpickr initialization

// Vibe Report Download Range
document.addEventListener("DOMContentLoaded", function () {
  flatpickr("#daterange", {
    mode: "range",
    dateFormat: "Y-m-d",
  });
});

// Day selector initialization
document.addEventListener("DOMContentLoaded", function () {
  flatpickr("#daySelector", {
    dateFormat: "Y-m-d",
    mode: "multiple",
  });
});

