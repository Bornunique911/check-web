require_relative '../spec_helper.rb'

shared_examples 'custom' do

  it "should register and redirect to newly created media" do
    api_create_team_and_project
    page = ProjectPage.new(config: @config, driver: @driver).load
           .create_media(input: @media_url)

    expect(page.contains_string?('Added')).to be(true)
    expect(page.contains_string?('User With Email')).to be(true)
    expect(page.status_label == 'UNSTARTED').to be(true)

    $media_id = page.driver.current_url.to_s.match(/\/media\/([0-9]+)$/)[1]
    expect($media_id.nil?).to be(false)
  end

  it "should register and redirect to newly created image media" do
    api_create_team_and_project
    page = ProjectPage.new(config: @config, driver: @driver).load
           .create_image_media(File.expand_path('../test.png', File.dirname(__FILE__)))

    expect(page.contains_string?('Added')).to be(true)
    expect(page.contains_string?('User With Email')).to be(true)
    expect(page.status_label == 'UNSTARTED').to be(true)

    $media_id = page.driver.current_url.to_s.match(/\/media\/([0-9]+)$/)[1]
    expect($media_id.nil?).to be(false)
  end

  it "should set status to media as a command" do
    media = api_create_team_project_and_claim
    @driver.navigate.to media.full_url
    sleep 2

    # Add a status as a command
    fill_field('#cmd-input', '/status In Progress')
    @driver.action.send_keys(:enter).perform
    sleep 5

    # Verify that status was added to annotations list
    expect(@driver.page_source.include?('Status')).to be(true)

    # Reload the page and verify that status is still there
    @driver.navigate.refresh
    sleep 5
    expect(@driver.page_source.include?('Status')).to be(true)
  end

  it "should change a media status via the dropdown menu" do
    media = api_create_team_project_and_claim
    @driver.navigate.to media.full_url
    sleep 2
    media_pg = MediaPage.new(config: @config, driver: @driver)
    expect(media_pg.status_label).to eq('UNSTARTED')

    media_pg.change_status(:verified)
    expect(media_pg.status_label).to eq('VERIFIED')
    expect(media_pg.contains_element?('.annotation__status--verified')).to be(true)
  end

  it "should search by status" do
    api_create_claim_and_go_to_search_page
    @driver.find_element(:xpath, "//*[contains(text(), 'Inconclusive')]").click
    sleep 10
    expect((@driver.title =~ /Inconclusive/).nil?).to be(false)
    expect((@driver.current_url.to_s.match(/not_applicable/)).nil?).to be(false)
    expect(@driver.page_source.include?('My search result')).to be(false)
    @driver.find_element(:xpath, "//*[contains(text(), 'Unstarted')]").click
    sleep 10
    expect((@driver.title =~ /Unstarted/).nil?).to be(false)
    expect((@driver.current_url.to_s.match(/undetermined/)).nil?).to be(false)
    expect(@driver.page_source.include?('My search result')).to be(true)
  end

  it "should search by status through URL" do
    api_create_claim_and_go_to_search_page
    @driver.navigate.to @config['self_url'] + '/' + get_team + '/search/%7B"status"%3A%5B"false"%5D%7D'
    sleep 10
    expect((@driver.title =~ /False/).nil?).to be(false)
    expect(@driver.page_source.include?('My search result')).to be(false)
    selected = @driver.find_elements(:css, '.media-tags__suggestion--selected').map(&:text).sort
    expect(selected == ['False', 'Created', 'Newest first', 'Media'].sort).to be(true)
  end

end
