-- Create custom ENUM type for evaluation results
CREATE TYPE RESULT AS ENUM ('A', 'B');

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: llm_provider
CREATE TABLE llm_provider (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    hf_link TEXT NOT NULL,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: prompt
CREATE TABLE prompt (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt TEXT NOT NULL,
    prompt_tokens INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: llm_model
CREATE TABLE llm_model (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    hf_link TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    provider UUID NOT NULL,
    license TEXT,
    version TEXT NOT NULL,
    param_count BIGINT NOT NULL,
    top_p REAL,
    temperature REAL,
    min_tokens INTEGER,
    max_tokens INTEGER,
    context_window INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: llm_prompt (junction table)
CREATE TABLE llm_prompt (
    model_id UUID NOT NULL,
    prompt_id UUID NOT NULL,
    "order" SMALLINT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (model_id, prompt_id),
    UNIQUE (model_id, "order")
);

-- Table: user
CREATE TABLE evaluator (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: user_prompt (junction table)
CREATE TABLE user_prompt (
    user_id UUID NOT NULL,
    prompt_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, prompt_id)
);

-- Table: dataset
CREATE TABLE dataset (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: datapoint
CREATE TABLE datapoint (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: llm_response
CREATE TABLE llm_response (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID NOT NULL,
    datapoint_id UUID NOT NULL,
    response TEXT NOT NULL,
    latency_ms INTEGER NOT NULL,
    token_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: media
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name TEXT,
    file_url TEXT,
    size INTEGER,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    duration INTEGER,
    thumbnail_url TEXT,
    codec TEXT,
    alt_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: response_media (junction table)
CREATE TABLE response_media (
    response_id UUID NOT NULL,
    media_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (response_id, media_id)
);

-- Table: feedback
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    response_id UUID NOT NULL,
    user_id UUID NOT NULL,
    feedback TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: evaluation_pairwise
CREATE TABLE evaluation_pairwise (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    response_a_id UUID NOT NULL,
    response_b_id UUID NOT NULL,
    feedback_a_id UUID,
    feedback_b_id UUID,
    result RESULT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: evaluation_single
CREATE TABLE evaluation_single (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    response_id UUID NOT NULL,
    feedback_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: score
CREATE TABLE score (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    user_id UUID,
    range INT4RANGE NOT NULL,
    step INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: feedback_score (junction table)
CREATE TABLE feedback_score (
    feedback_id UUID NOT NULL,
    score_id UUID NOT NULL,
    score DECIMAL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (feedback_id, score_id)
);

-- Table: tag
CREATE TABLE tag (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: feedback_tag (junction table)
CREATE TABLE feedback_tag (
    feedback_id UUID NOT NULL,
    tag_id UUID NOT NULL,
    value BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (feedback_id, tag_id)
);

-- Table: metric
CREATE TABLE metric (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: model_metric (junction table)
CREATE TABLE model_metric (
    model_id UUID NOT NULL,
    metric_id UUID NOT NULL,
    score DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (model_id, metric_id)
);

-- Table: provider_metric (junction table)
CREATE TABLE provider_metric (
    provider_id UUID NOT NULL,
    metric_id UUID NOT NULL,
    score DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (provider_id, metric_id)
);

-- Add Foreign Key Constraints (with NO CASCADE DELETE)

-- llm_model.provider references llm_provider.id
ALTER TABLE llm_model
ADD CONSTRAINT fk_llm_model_provider
FOREIGN KEY (provider) REFERENCES llm_provider(id)
ON DELETE RESTRICT;

-- llm_prompt foreign keys
ALTER TABLE llm_prompt
ADD CONSTRAINT fk_llm_prompt_model
FOREIGN KEY (model_id) REFERENCES llm_model(id)
ON DELETE RESTRICT;

ALTER TABLE llm_prompt
ADD CONSTRAINT fk_llm_prompt_prompt
FOREIGN KEY (prompt_id) REFERENCES prompt(id)
ON DELETE RESTRICT;

-- user_prompt foreign keys
ALTER TABLE user_prompt
ADD CONSTRAINT fk_user_prompt_user
FOREIGN KEY (user_id) REFERENCES evaluator(id)
ON DELETE RESTRICT;

ALTER TABLE user_prompt
ADD CONSTRAINT fk_user_prompt_prompt
FOREIGN KEY (prompt_id) REFERENCES prompt(id)
ON DELETE RESTRICT;

-- datapoint foreign key
ALTER TABLE datapoint
ADD CONSTRAINT fk_datapoint_dataset
FOREIGN KEY (dataset_id) REFERENCES dataset(id)
ON DELETE RESTRICT;

-- llm_response foreign keys
ALTER TABLE llm_response
ADD CONSTRAINT fk_llm_response_model
FOREIGN KEY (model_id) REFERENCES llm_model(id)
ON DELETE RESTRICT;

ALTER TABLE llm_response
ADD CONSTRAINT fk_llm_response_datapoint
FOREIGN KEY (datapoint_id) REFERENCES datapoint(id)
ON DELETE RESTRICT;

-- response_media foreign keys
ALTER TABLE response_media
ADD CONSTRAINT fk_response_media_response
FOREIGN KEY (response_id) REFERENCES llm_response(response_id)
ON DELETE RESTRICT;

ALTER TABLE response_media
ADD CONSTRAINT fk_response_media_media
FOREIGN KEY (media_id) REFERENCES media(id)
ON DELETE RESTRICT;

-- feedback foreign keys
ALTER TABLE feedback
ADD CONSTRAINT fk_feedback_response
FOREIGN KEY (response_id) REFERENCES llm_response(response_id)
ON DELETE RESTRICT;

ALTER TABLE feedback
ADD CONSTRAINT fk_feedback_user
FOREIGN KEY (user_id) REFERENCES evaluator(id)
ON DELETE RESTRICT;

-- evaluation_pairwise foreign keys
ALTER TABLE evaluation_pairwise
ADD CONSTRAINT fk_evaluation_pairwise_response_a
FOREIGN KEY (response_a_id) REFERENCES llm_response(response_id)
ON DELETE RESTRICT;

ALTER TABLE evaluation_pairwise
ADD CONSTRAINT fk_evaluation_pairwise_response_b
FOREIGN KEY (response_b_id) REFERENCES llm_response(response_id)
ON DELETE RESTRICT;

ALTER TABLE evaluation_pairwise
ADD CONSTRAINT fk_evaluation_pairwise_feedback_a
FOREIGN KEY (feedback_a_id) REFERENCES feedback(id)
ON DELETE RESTRICT;

ALTER TABLE evaluation_pairwise
ADD CONSTRAINT fk_evaluation_pairwise_feedback_b
FOREIGN KEY (feedback_b_id) REFERENCES feedback(id)
ON DELETE RESTRICT;

-- evaluation_single foreign keys
ALTER TABLE evaluation_single
ADD CONSTRAINT fk_evaluation_single_response
FOREIGN KEY (response_id) REFERENCES llm_response(response_id)
ON DELETE RESTRICT;

ALTER TABLE evaluation_single
ADD CONSTRAINT fk_evaluation_single_feedback
FOREIGN KEY (feedback_id) REFERENCES feedback(id)
ON DELETE RESTRICT;

-- score foreign key
ALTER TABLE score
ADD CONSTRAINT fk_score_user
FOREIGN KEY (user_id) REFERENCES evaluator(id)
ON DELETE RESTRICT;

-- feedback_score foreign keys
ALTER TABLE feedback_score
ADD CONSTRAINT fk_feedback_score_feedback
FOREIGN KEY (feedback_id) REFERENCES feedback(id)
ON DELETE RESTRICT;

ALTER TABLE feedback_score
ADD CONSTRAINT fk_feedback_score_score
FOREIGN KEY (score_id) REFERENCES score(id)
ON DELETE RESTRICT;

-- tag foreign key
ALTER TABLE tag
ADD CONSTRAINT fk_tag_user
FOREIGN KEY (user_id) REFERENCES evaluator(id)
ON DELETE RESTRICT;

-- feedback_tag foreign keys
ALTER TABLE feedback_tag
ADD CONSTRAINT fk_feedback_tag_feedback
FOREIGN KEY (feedback_id) REFERENCES feedback(id)
ON DELETE RESTRICT;

ALTER TABLE feedback_tag
ADD CONSTRAINT fk_feedback_tag_tag
FOREIGN KEY (tag_id) REFERENCES tag(id)
ON DELETE RESTRICT;

-- model_metric foreign keys
ALTER TABLE model_metric
ADD CONSTRAINT fk_model_metric_model
FOREIGN KEY (model_id) REFERENCES llm_model(id)
ON DELETE RESTRICT;

ALTER TABLE model_metric
ADD CONSTRAINT fk_model_metric_metric
FOREIGN KEY (metric_id) REFERENCES metric(id)
ON DELETE RESTRICT;

-- provider_metric foreign keys
ALTER TABLE provider_metric
ADD CONSTRAINT fk_provider_metric_provider
FOREIGN KEY (provider_id) REFERENCES llm_provider(id)
ON DELETE RESTRICT;

ALTER TABLE provider_metric
ADD CONSTRAINT fk_provider_metric_metric
FOREIGN KEY (metric_id) REFERENCES metric(id)
ON DELETE RESTRICT;

-- Add validation rules (CHECK constraints)

-- Ensure token_count is positive
ALTER TABLE prompt 
ADD CONSTRAINT positive_prompt_tokens CHECK (prompt_tokens > 0);

-- Ensure param_count is positive
ALTER TABLE llm_model 
ADD CONSTRAINT positive_param_count CHECK (param_count > 0);

-- Ensure context_window is positive
ALTER TABLE llm_model 
ADD CONSTRAINT positive_context_window CHECK (context_window > 0);

-- Ensure token_count and latency_ms are positive
ALTER TABLE llm_response 
ADD CONSTRAINT positive_token_count CHECK (token_count > 0);

ALTER TABLE llm_response 
ADD CONSTRAINT positive_latency CHECK (latency_ms > 0);

-- Ensure responses in pairwise evaluation are different
ALTER TABLE evaluation_pairwise 
ADD CONSTRAINT different_responses CHECK (response_a_id != response_b_id);

-- Ensure step in score is positive
ALTER TABLE score 
ADD CONSTRAINT positive_step CHECK (step > 0);

-- Create appropriate indexes

-- Indexes for llm_provider
CREATE INDEX idx_llm_provider_name ON llm_provider(name);

-- Indexes for prompt
CREATE INDEX idx_prompt_tokens ON prompt(prompt_tokens);

-- Indexes for llm_model
CREATE INDEX idx_llm_model_name ON llm_model(name);
CREATE INDEX idx_llm_model_provider ON llm_model(provider);
CREATE INDEX idx_llm_model_param_count ON llm_model(param_count);

-- Indexes for llm_prompt
CREATE INDEX idx_llm_prompt_model ON llm_prompt(model_id);
CREATE INDEX idx_llm_prompt_prompt ON llm_prompt(prompt_id);
CREATE INDEX idx_llm_prompt_order ON llm_prompt("order");

-- Indexes for user
CREATE INDEX idx_user_name ON evaluator(name);

-- Indexes for user_prompt
CREATE INDEX idx_user_prompt_user ON user_prompt(user_id);
CREATE INDEX idx_user_prompt_prompt ON user_prompt(prompt_id);

-- Indexes for dataset
CREATE INDEX idx_dataset_name ON dataset(name);

-- Indexes for datapoint
CREATE INDEX idx_datapoint_dataset ON datapoint(dataset_id);

-- Indexes for llm_response
CREATE INDEX idx_llm_response_model ON llm_response(model_id);
CREATE INDEX idx_llm_response_datapoint ON llm_response(datapoint_id);
CREATE INDEX idx_llm_response_token_count ON llm_response(token_count);
CREATE INDEX idx_llm_response_latency ON llm_response(latency_ms);

-- Indexes for response_media
CREATE INDEX idx_response_media_response ON response_media(response_id);
CREATE INDEX idx_response_media_media ON response_media(media_id);

-- Indexes for media
CREATE INDEX idx_media_mime_type ON media(mime_type);

-- Indexes for feedback
CREATE INDEX idx_feedback_response ON feedback(response_id);
CREATE INDEX idx_feedback_user ON feedback(user_id);

-- Indexes for evaluation_pairwise
CREATE INDEX idx_evaluation_pairwise_response_a ON evaluation_pairwise(response_a_id);
CREATE INDEX idx_evaluation_pairwise_response_b ON evaluation_pairwise(response_b_id);
CREATE INDEX idx_evaluation_pairwise_result ON evaluation_pairwise(result);

-- Indexes for evaluation_single
CREATE INDEX idx_evaluation_single_response ON evaluation_single(response_id);
CREATE INDEX idx_evaluation_single_feedback ON evaluation_single(feedback_id);

-- Indexes for score
CREATE INDEX idx_score_name ON score(name);
CREATE INDEX idx_score_user ON score(user_id);

-- Indexes for feedback_score
CREATE INDEX idx_feedback_score_feedback ON feedback_score(feedback_id);
CREATE INDEX idx_feedback_score_score ON feedback_score(score_id);
CREATE INDEX idx_feedback_score_score_value ON feedback_score(score);

-- Indexes for tag
CREATE INDEX idx_tag_name ON tag(name);
CREATE INDEX idx_tag_user ON tag(user_id);

-- Indexes for feedback_tag
CREATE INDEX idx_feedback_tag_feedback ON feedback_tag(feedback_id);
CREATE INDEX idx_feedback_tag_tag ON feedback_tag(tag_id);
CREATE INDEX idx_feedback_tag_value ON feedback_tag(value);

-- Indexes for metric
CREATE INDEX idx_metric_name ON metric(name);

-- Indexes for model_metric
CREATE INDEX idx_model_metric_model ON model_metric(model_id);
CREATE INDEX idx_model_metric_metric ON model_metric(metric_id);
CREATE INDEX idx_model_metric_score ON model_metric(score);

-- Indexes for provider_metric
CREATE INDEX idx_provider_metric_provider ON provider_metric(provider_id);
CREATE INDEX idx_provider_metric_metric ON provider_metric(metric_id);
CREATE INDEX idx_provider_metric_score ON provider_metric(score);

-- Add schema documentation

-- Table comments
COMMENT ON TABLE llm_provider IS 'Stores information about language model providers';
COMMENT ON TABLE prompt IS 'Stores prompts used to generate responses from language models';
COMMENT ON TABLE llm_model IS 'Stores information about language models';
COMMENT ON TABLE llm_prompt IS 'Junction table linking models to their prompts with ordering';
COMMENT ON TABLE evaluator IS 'Stores user information';
COMMENT ON TABLE user_prompt IS 'Junction table linking users to prompts they have created or used';
COMMENT ON TABLE dataset IS 'Stores datasets used for model evaluation';
COMMENT ON TABLE datapoint IS 'Stores individual data points within datasets';
COMMENT ON TABLE llm_response IS 'Stores responses generated by language models';
COMMENT ON TABLE media IS 'Stores media files that may be included in model responses';
COMMENT ON TABLE response_media IS 'Junction table linking responses to their media';
COMMENT ON TABLE feedback IS 'Stores user feedback on model responses';
COMMENT ON TABLE evaluation_pairwise IS 'Stores pairwise comparisons between two model responses';
COMMENT ON TABLE evaluation_single IS 'Stores individual evaluations of model responses';
COMMENT ON TABLE score IS 'Defines scoring systems used in evaluations';
COMMENT ON TABLE feedback_score IS 'Junction table linking feedback to scores';
COMMENT ON TABLE tag IS 'Stores tags used for categorizing feedback';
COMMENT ON TABLE feedback_tag IS 'Junction table linking feedback to tags';
COMMENT ON TABLE metric IS 'Stores metrics used for evaluating models and providers';
COMMENT ON TABLE model_metric IS 'Junction table linking models to their performance metrics';
COMMENT ON TABLE provider_metric IS 'Junction table linking providers to their performance metrics';

-- Column comments
COMMENT ON COLUMN llm_provider.name IS 'Name of the LLM provider';
COMMENT ON COLUMN llm_provider.hf_link IS 'Hugging Face link to the provider';
COMMENT ON COLUMN llm_provider.country IS 'Country where the provider is based';

COMMENT ON COLUMN prompt.prompt IS 'The actual prompt text';
COMMENT ON COLUMN prompt.prompt_tokens IS 'Number of tokens in the prompt';
COMMENT ON COLUMN prompt.description IS 'Description or purpose of the prompt';

COMMENT ON COLUMN llm_model.name IS 'Name of the language model';
COMMENT ON COLUMN llm_model.hf_link IS 'Hugging Face link to the model';
COMMENT ON COLUMN llm_model.description IS 'Description of the model capabilities';
COMMENT ON COLUMN llm_model.provider IS 'Reference to the model provider';
COMMENT ON COLUMN llm_model.license IS 'License under which the model is available';
COMMENT ON COLUMN llm_model.version IS 'Version of the model';
COMMENT ON COLUMN llm_model.param_count IS 'Number of parameters in the model (in billions)';
COMMENT ON COLUMN llm_model.top_p IS 'Top-p sampling parameter used for the model';
COMMENT ON COLUMN llm_model.temperature IS 'Temperature parameter used for the model';
COMMENT ON COLUMN llm_model.min_tokens IS 'Minimum number of tokens in responses';
COMMENT ON COLUMN llm_model.max_tokens IS 'Maximum number of tokens in responses';
COMMENT ON COLUMN llm_model.context_window IS 'Context window size in tokens';

COMMENT ON COLUMN llm_prompt.model_id IS 'Reference to the language model';
COMMENT ON COLUMN llm_prompt.prompt_id IS 'Reference to the prompt';
COMMENT ON COLUMN llm_prompt."order" IS 'Order in which prompts are presented to the model';

COMMENT ON COLUMN evaluator.name IS 'Name of the user';

COMMENT ON COLUMN dataset.name IS 'Name of the dataset';
COMMENT ON COLUMN dataset.description IS 'Description of the dataset contents and purpose';

COMMENT ON COLUMN datapoint.dataset_id IS 'Reference to the dataset this point belongs to';
COMMENT ON COLUMN datapoint.data IS 'JSON data representing the datapoint';

COMMENT ON COLUMN llm_response.id IS 'Unique identifier for the response';
COMMENT ON COLUMN llm_response.model_id IS 'Reference to the model that generated the response';
COMMENT ON COLUMN llm_response.datapoint_id IS 'Reference to the datapoint that prompted the response';
COMMENT ON COLUMN llm_response.response IS 'The actual text response generated by the model';
COMMENT ON COLUMN llm_response.latency_ms IS 'Time taken to generate the response in milliseconds';
COMMENT ON COLUMN llm_response.token_count IS 'Number of tokens in the response';

COMMENT ON COLUMN media.file_name IS 'Name of the media file';
COMMENT ON COLUMN media.file_url IS 'URL where the media file is stored';
COMMENT ON COLUMN media.size IS 'Size of the media file in bytes';
COMMENT ON COLUMN media.mime_type IS 'MIME type of the media file';
COMMENT ON COLUMN media.width IS 'Width of the media in pixels (for images/videos)';
COMMENT ON COLUMN media.height IS 'Height of the media in pixels (for images/videos)';
COMMENT ON COLUMN media.duration IS 'Duration of the media in seconds (for audio/video)';
COMMENT ON COLUMN media.thumbnail_url IS 'URL to a thumbnail image';
COMMENT ON COLUMN media.codec IS 'Codec used for the media';
COMMENT ON COLUMN media.alt_text IS 'Alternative text description of the media';

COMMENT ON COLUMN feedback.response_id IS 'Reference to the response being evaluated';
COMMENT ON COLUMN feedback.user_id IS 'Reference to the user providing feedback';
COMMENT ON COLUMN feedback.feedback IS 'Textual feedback provided by the user';

COMMENT ON COLUMN evaluation_pairwise.response_a_id IS 'Reference to the first response being compared';
COMMENT ON COLUMN evaluation_pairwise.response_b_id IS 'Reference to the second response being compared';
COMMENT ON COLUMN evaluation_pairwise.feedback_a_id IS 'Reference to feedback for the first response';
COMMENT ON COLUMN evaluation_pairwise.feedback_b_id IS 'Reference to feedback for the second response';
COMMENT ON COLUMN evaluation_pairwise.result IS 'Result of the comparison (A or B)';

COMMENT ON COLUMN evaluation_single.response_id IS 'Reference to the response being evaluated';
COMMENT ON COLUMN evaluation_single.feedback_id IS 'Reference to the feedback for this evaluation';

COMMENT ON COLUMN score.name IS 'Name of the scoring system';
COMMENT ON COLUMN score.user_id IS 'Reference to the user who created the scoring system';
COMMENT ON COLUMN score.range IS 'Range of possible scores (e.g., [1,5])';
COMMENT ON COLUMN score.step IS 'Increment between possible scores (e.g., 1)';

COMMENT ON COLUMN feedback_score.feedback_id IS 'Reference to the feedback being scored';
COMMENT ON COLUMN feedback_score.score_id IS 'Reference to the scoring system';
COMMENT ON COLUMN feedback_score.score IS 'Actual score value';

COMMENT ON COLUMN tag.name IS 'Name of the tag';
COMMENT ON COLUMN tag.user_id IS 'Reference to the user who created the tag';

COMMENT ON COLUMN feedback_tag.feedback_id IS 'Reference to the feedback being tagged';
COMMENT ON COLUMN feedback_tag.tag_id IS 'Reference to the tag';
COMMENT ON COLUMN feedback_tag.value IS 'Boolean indicating whether the tag applies';

COMMENT ON COLUMN metric.name IS 'Name of the metric';
COMMENT ON COLUMN metric.description IS 'Description of what the metric measures';

COMMENT ON COLUMN model_metric.model_id IS 'Reference to the model being measured';
COMMENT ON COLUMN model_metric.metric_id IS 'Reference to the metric';
COMMENT ON COLUMN model_metric.score IS 'Score for this model on this metric';

COMMENT ON COLUMN provider_metric.provider_id IS 'Reference to the provider being measured';
COMMENT ON COLUMN provider_metric.metric_id IS 'Reference to the metric';
COMMENT ON COLUMN provider_metric.score IS 'Score for this provider on this metric';

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_llm_provider_timestamp
BEFORE UPDATE ON llm_provider
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_prompt_timestamp
BEFORE UPDATE ON prompt
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_llm_model_timestamp
BEFORE UPDATE ON llm_model
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_llm_prompt_timestamp
BEFORE UPDATE ON llm_prompt
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_user_timestamp
BEFORE UPDATE ON evaluator
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_user_prompt_timestamp
BEFORE UPDATE ON user_prompt
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_dataset_timestamp
BEFORE UPDATE ON dataset
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_datapoint_timestamp
BEFORE UPDATE ON datapoint
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_media_timestamp
BEFORE UPDATE ON media
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_feedback_timestamp
BEFORE UPDATE ON feedback
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_evaluation_pairwise_timestamp
BEFORE UPDATE ON evaluation_pairwise
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_evaluation_single_timestamp
BEFORE UPDATE ON evaluation_single
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_score_timestamp
BEFORE UPDATE ON score
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_feedback_score_timestamp
BEFORE UPDATE ON feedback_score
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_tag_timestamp
BEFORE UPDATE ON tag
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_feedback_tag_timestamp
BEFORE UPDATE ON feedback_tag
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_metric_timestamp
BEFORE UPDATE ON metric
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_model_metric_timestamp
BEFORE UPDATE ON model_metric
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_provider_metric_timestamp
BEFORE UPDATE ON provider_metric
FOR EACH ROW EXECUTE FUNCTION update_timestamp(); 