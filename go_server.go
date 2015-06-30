package main

import (
        //      "io"
        "encoding/json"
        "net/http"
        "net/url"
        "fmt"
        //      "strconv"
)
type insteon_response struct {
    Access_token, Refresh_token, Token_type     string
    Expires_in                                  int
}

var client_id string = "API_KEY"
var client_secret string = "CLIENT_SECRET"
var redirect_uri string = "http://veryoblivio.us:9001/"

func main() {
        http.HandleFunc("/getkey", bar)
        http.HandleFunc("/", foo)
        http.ListenAndServe(":9001", nil)
}

func bar(w http.ResponseWriter, r *http.Request) {
		r.ParseForm()
		var u string
		_, ok := r.Form["return_to"]
		if ok {
			u = r.Form["return_to"][0]
		} else{
			u = "no_return"
    }
    url := "http://connect.insteon.com/api/v2/oauth2/auth?client_id=" + client_id + "&state="+ u + "&response_type=code&redirect_uri=" + redirect_uri
    http.Redirect(w, r, url, http.StatusFound)
    //fmt.Println("Requested from " + r.URL.Path)
}
func foo(w http.ResponseWriter, r *http.Request) {
        r.ParseForm()
        u := r.Form
				var state string
				var code string
				var prestate []string
				var precode []string
				var ok bool
				prestate, ok = u["state"]
				if ok {
					state = prestate[0]
					} else { return}
				precode, ok = u["code"]
				if ok {
					code = precode[0]
					} else { return}
        v := url.Values{}
        v.Set("code", code)
        v.Add("client_id", client_id)
        v.Add("client_secret", client_secret)
        v.Add("grant_type", "authorization_code")
        resp, _ := http.PostForm("https://connect.insteon.com/api/v2/oauth2/token", v)
        var i insteon_response
        decoder := json.NewDecoder(resp.Body)
        decoder.Decode(&i)
        fmt.Println(i)
        js, _ := json.Marshal(i)
        var new_url string
        if state == "no_return" {
            new_url = "pebblejs://close#" + string(js[:])
        } else {
						v = url.Values{}
						v.Add("Access_token", i.Access_token)
						v.Add("Refresh_token", i.Refresh_token)
						new_url = state + v.Encode()
				}

        http.Redirect(w, r, new_url, http.StatusFound)
}
